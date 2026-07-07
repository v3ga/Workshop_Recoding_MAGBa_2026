//------------------------------------------------------------
const FORMATS =
{
  a4:  { label: "A4",         size: "a4",        orientable: true  },
  a3:  { label: "A3",         size: "a3",        orientable: true  },
  s15: { label: "15 x 15 cm", size: "15cmx15cm", orientable: false },
  s25: { label: "25 x 25 cm", size: "25cmx25cm", orientable: false },
};
const MARGINS = "1cm";

//------------------------------------------------------------
let svgRaw = null, svgTransformed = null, hpgl = "";
let isConnected = false;
let currentFormatKey = "a4";
let originalFileBaseName = "svg";

//------------------------------------------------------------
let fileInput, svgPreviewSource, selectFormat, selectOrientation, btnTransform;
let svgPreviewResult, hpglPreviewEl, btnSaveSvg, btnSaveHpgl, btnCopyHpgl, btnConvert, btnConnect, btnPlot;
let checkboxSingleLayer;
let btnTabSvg, btnTabHpgl;
let serialCo, rolandDXY;

//------------------------------------------------------------
function setup()
{
  noCanvas();
  createUI();
  createSerial();
}

//------------------------------------------------------------
function createUI()
{
  let app = createDiv().id('app');

  createColumnSource(app);
  createColumnResult(app);

  showResultTab('svg');
}

//------------------------------------------------------------
// Left column : drop a SVG, choose a page format, send it to vpype
//------------------------------------------------------------
function createColumnSource(parent)
{
  let col = createDiv().id('col-source').addClass('column').parent(parent);

  let controls = createDiv().addClass('controls').parent(col);

  selectFormat = createSelect().parent(controls);
  Object.entries(FORMATS).forEach( ([key, fmt]) => selectFormat.option(fmt.label, key) );
  selectFormat.changed(onFormatChanged);

  selectOrientation = createSelect().parent(controls);
  selectOrientation.option('Portrait',  'portrait');
  selectOrientation.option('Landscape', 'landscape');

  btnTransform = createButton('Transform with vpype').parent(controls);
  btnTransform.mousePressed(onTransformWithVpype);
  enableBtn(btnTransform, false);

  // The drop zone IS the preview : its placeholder text sits as the
  // background until a SVG is dropped, so both columns start at the
  // same height.
  svgPreviewSource = createDiv('Drag & drop a SVG file here<br>or click to select one')
    .id('svg-preview-source')
    .addClass('preview')
    .addClass('drop-zone')
    .addClass('is-empty')
    .parent(col);

  fileInput = createFileInput(onFileSelected).parent(col);
  fileInput.elt.accept = '.svg,image/svg+xml';
  fileInput.hide();

  let elt = svgPreviewSource.elt;
  elt.addEventListener('dragover', e => { e.preventDefault(); svgPreviewSource.addClass('drag-over'); });
  elt.addEventListener('dragleave', () => svgPreviewSource.removeClass('drag-over'));
  elt.addEventListener('drop', e =>
  {
    e.preventDefault();
    svgPreviewSource.removeClass('drag-over');
    if (e.dataTransfer.files.length)
      readSvgFile(e.dataTransfer.files[0]);
  });
  elt.addEventListener('click', () => fileInput.elt.click());

  onFormatChanged();
}

//------------------------------------------------------------
function onFormatChanged()
{
  const orientable = FORMATS[selectFormat.value()].orientable;
  enableBtn(selectOrientation, orientable);
}

//------------------------------------------------------------
function onFileSelected(file)
{
  if (file.file)
    readSvgFile(file.file);
}

//------------------------------------------------------------
function readSvgFile(file)
{
  if (!file.type.match('svg') && !file.name.match(/\.svg$/i))
  {
    console.warn(`ignored file: ${file.name} is not a SVG`);
    return;
  }

  originalFileBaseName = file.name.replace(/\.[^/.]+$/, "") || "svg";

  const reader  = new FileReader();
  reader.onload = e =>
  {
    svgRaw = e.target.result;
    svgPreviewSource.elt.innerHTML = svgRaw;
    svgPreviewSource.removeClass('is-empty');
    enableBtn(btnTransform, true);
  };
  reader.readAsText(file);
}

//------------------------------------------------------------
/**
 * Builds an output filename as [original name]_[format]_[orientation].[ext]
 * The orientation part is omitted for formats that aren't orientable
 * (e.g. the square formats).
 */
function buildOutputFilename(ext)
{
  const format = FORMATS[currentFormatKey];
  let parts    = [originalFileBaseName, format.size];
  if (format.orientable)
    parts.push(selectOrientation.value());
  return parts.join('_') + '.' + ext;
}

//------------------------------------------------------------
async function onTransformWithVpype()
{
  if (!svgRaw)
    return;

  enableBtn(btnTransform, false);
  currentFormatKey = selectFormat.value();
  const format = FORMATS[currentFormatKey];
  const size   = format.size;

  const args = ['layout'];
  if (format.orientable && selectOrientation.value() == 'landscape')
    args.push('--landscape');
  args.push('--fit-to-margins', MARGINS, size);

  const result = await vpype(svgRaw, args);
  if (result)
  {
    svgTransformed                 = result;
    svgPreviewResult.elt.innerHTML = svgTransformed;
    hpgl                           = "";
    hpglPreviewEl.elt.textContent  = "";
    enableBtn(btnSaveSvg,  true);
    enableBtn(btnConvert,  true);
    enableBtn(btnSaveHpgl, false);
    enableBtn(btnCopyHpgl, false);
    enableBtn(btnPlot,     false);
    showResultTab('svg');
  }

  enableBtn(btnTransform, true);
}

//------------------------------------------------------------
// Right column : transformed SVG / HPGL toggle, HPGL conversion, serial plot
//------------------------------------------------------------
function createColumnResult(parent)
{
  let col = createDiv().id('col-result').addClass('column').parent(parent);

  let controls = createDiv().addClass('controls').parent(col);
  btnSaveSvg          = createButton('Save SVG').parent(controls);
  btnConvert          = createButton('Convert to HPGL').parent(controls);
  checkboxSingleLayer = createCheckbox('Merge layers into one pen', true).parent(controls);
  btnSaveHpgl         = createButton('Save HPGL').parent(controls);
  btnCopyHpgl         = createButton('Copy').parent(controls).addClass('btn-small');
  btnConnect          = createButton('Connect to serial port').parent(controls);
  btnPlot             = createButton('Plot').parent(controls);

  // The SVG and HPGL panes are stacked on top of each other inside
  // #result-view, with the tab buttons floating in a corner of it.
  let resultView = createDiv().id('result-view').parent(col);

  svgPreviewResult = createDiv().id('svg-preview-result').addClass('preview').addClass('pane').parent(resultView);
  hpglPreviewEl    = createElement('pre').id('hpgl-preview').addClass('preview').addClass('pane').parent(resultView);

  let tabs   = createDiv().addClass('tabs').parent(resultView);
  btnTabSvg  = createButton('SVG').parent(tabs);
  btnTabHpgl = createButton('HPGL').parent(tabs);
  btnTabSvg.mousePressed(  () => showResultTab('svg')  );
  btnTabHpgl.mousePressed( () => showResultTab('hpgl') );

  btnSaveSvg.mousePressed( () =>
  {
    if (svgTransformed)
      saveSvg(buildOutputFilename('svg'), svgTransformed);
  });

  btnSaveHpgl.mousePressed( () =>
  {
    if (hpgl)
      saveHPGL(buildOutputFilename('hpgl'), hpgl);
  });

  btnCopyHpgl.mousePressed( async () =>
  {
    if (hpgl)
      await navigator.clipboard.writeText(hpgl);
  });

  btnConvert.mousePressed(onConvertToHPGL);

  btnConnect.mousePressed( async () =>
  {
    isConnected = await serialCo.connect();
    if (isConnected)
    {
      enableBtn(btnConnect, false);
      enableBtnPlot();
    }
  });

  btnPlot.mousePressed( async () =>
  {
    if (rolandDXY && hpgl != "")
    {
      enableBtn(btnPlot, false);
      await rolandDXY.plot(hpgl);
      enableBtn(btnPlot, true);
    }
  });

  enableBtn(btnSaveSvg,  false);
  enableBtn(btnConvert,  false);
  enableBtn(btnSaveHpgl, false);
  enableBtn(btnCopyHpgl, false);
  enableBtn(btnConnect,  false);
  enableBtn(btnPlot,     false);
}

//------------------------------------------------------------
async function onConvertToHPGL()
{
  if (!svgTransformed)
    return;

  enableBtn(btnConvert, false);
  const size = FORMATS[currentFormatKey].size;
  hpgl        = await svgToHPGL(svgTransformed, { margins: MARGINS, format: size, single_layer: checkboxSingleLayer.checked() });

  if (hpgl)
  {
    hpglPreviewEl.elt.textContent = hpgl;
    enableBtn(btnSaveHpgl, true);
    enableBtn(btnCopyHpgl, true);
    enableBtnPlot();
  }
  else
  {
    hpglPreviewEl.elt.textContent = "Error: the server did not return any HPGL code (check the browser console and server.py logs).";
    enableBtn(btnSaveHpgl, false);
    enableBtn(btnCopyHpgl, false);
  }
  showResultTab('hpgl');
  enableBtn(btnConvert, true);
}

//------------------------------------------------------------
function enableBtnPlot()
{
  if (isConnected && hpgl != "")
    enableBtn(btnPlot, true);
}

//------------------------------------------------------------
function createSerial()
{
  serialCo = new SerialConnection();
  if (SerialConnection.isAvailable())
  {
    rolandDXY = new PlotterRolandDXY(serialCo);
    enableBtn(btnConnect);
  }
}

//------------------------------------------------------------
function showResultTab(tab)
{
  svgPreviewResult.removeClass('active');
  hpglPreviewEl.removeClass('active');
  btnTabSvg.removeClass('active');
  btnTabHpgl.removeClass('active');

  if (tab == 'hpgl')
  {
    hpglPreviewEl.addClass('active');
    btnTabHpgl.addClass('active');
  }
  else
  {
    svgPreviewResult.addClass('active');
    btnTabSvg.addClass('active');
  }
}

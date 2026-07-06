class UI
{
    static element(type, opts={})   { return new UIElement(type,    opts) }
    static p(opts={})               { return UI.element("p",        opts) }
    static span(opts={})            { return UI.element("span",     opts) }
    static div(opts={})             { return UI.element("div",      opts) }
    static label(opts={})           { return UI.element("label",    opts) }
    static h1(opts={})              { return UI.element("h1",       opts) }
    static h2(opts={})              { return UI.element("h2",       opts) }
    static h3(opts={})              { return UI.element("h3",       opts) }
    static select_(opts={})         { return UI.element("select",   opts) }
    static textInput(opts={})       { return new UITextInput(opts)        }
    static textArea(opts={})        { return new UITextArea(opts)         }
    static button(opts={})          { return new UIButton(opts)           }
    static img(opts={})             { return new UIImage(opts)            }
    static colorPicker(opts={})     { return UI.input("color", opts)      }
    
    static input(type, opts={})     
    {
        return UI.element("input", opts).setAttribute("type", type);
    }  
    
    static slider(opts={})          
    {
        return new UISlider(opts);
    }

    static checkbox(opts={})          
    {
        return new UICheckbox(opts);
    }

    static select(opts={})
    { 
        return new UISelect(opts) 
    }

    static title(s)
    {
        return UI.label().class("underline").text(s);
    }


}

class UIElement
{
    constructor(type, opts={})
    {
        this.element = document.createElement(type);
        this.set(opts);
        this.bFlex = false;
    }

    elmt()
    {
        return this.element;
    }
    
    clear()
    {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
          }        
    }

    set(opts={})
    {
        if (opts.id)        this.id(opts.id)
        if (opts.class)     this.class(opts.class);
        if (opts.attr)      this.setAttributes(opts.attr);
    }    

    hide()
    {
        this.element.style.display = "none";
        return this;
    }

    show()
    {
        this.element.style.display = this.bFlex ? "flex" : "block";
        return this;
    }
    
    setAttribute(key,value)
    {
        this.element.setAttribute(key,value);
        return this;
    }

    attr(attr={})
    {
        return this.setAttributes(attr);
    }

    setAttributes( attr={})
    {
        for (const [key,value] of Object.entries(attr))
            this.setAttribute(key,value);
        return this;
    }

    id(id)
    {
        return this.setAttribute("id",id);
    }    

    addClass(class_)
    {
        this.elmt().classList.add(class_);
        return this;
    }

    removeClass(class_)
    {
        this.elmt().classList.remove(class_);
        return this;
    }

    class(class_)
    {
        return this.setAttribute("class",class_);
    }  

    text(s)
    {
        this.element.innerHTML = s;
        return this;
    }

    child(elmt)
    {
        if (elmt)
        {
            if (Array.isArray(elmt))
                elmt.forEach( e => this.child(e) );
            else
            {
                if (elmt)
                    this.appendChild(elmt);
            }
        }
        return this;
    }
    
    appendChild(elmt)
    {
        if (elmt)
            this.element.appendChild(elmt.elmt());
        return this;
    }

    // https://www.w3schools.com/jsref/met_node_insertadjacentelement.asp
    insertAdjacentElement(elmt,where)
    {
        if (elmt)
            this.element.insertAdjacentElement(where, elmt.elmt());
        return this;
    }

    bindToParameter(parameter){}
    val(v){}
    disable(){}
}

class UIButton extends UIElement
{
    constructor(opts={})
    {
        super("button", opts);
        if (opts.label)
            this.text(opts.label);
    }

    click(cb)
    {
        this.cb = cb;
        this.elmt().addEventListener("click", this.cb);
        return this;
    }

    removeClick()
    {
        this.elmt().removeEventListener("click", this.cb);
        return this;
    }

    disable(is)
    {
        this.elmt().disabled = is??true;
        return this;
    }

    enable(is)
    {
        return this.disable(false);
    }

}
  
class UIButtonLoad extends UIButton
{
    constructor(opts={})
    {
        super(opts);

        this.fileInput = UI.input("file").hide();
        this.fileInput.elmt().addEventListener("change", e => 
        {
            let file = e.target.files[0];
            let reader = new FileReader();

            reader.onload = event => {
              this.onload(file, event.target.result) 
            };
            reader.readAsText(file);
        });

        this.elmt().addEventListener("click", e=>
        {
            this.fileInput.elmt().click();
        });

        document.body.append(this.fileInput.elmt());
    }

    click(cb)
    {
        this.cbClick = cb;
        return this;
    }

    onload(file, content)
    {
        if (this.cbClick) 
        {
            this.cbClick( JSON.parse(content), file.name ) 
        }
    }
}

class UIButtonLoadSVG extends UIButtonLoad
{
    constructor(opts)
    {
        super(opts);
        this.fileInput.elmt().setAttribute("accept", ".svg");
    }

    onload(file, content)
    {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(content, 'image/svg+xml');

        if (this.cbClick) 
            this.cbClick( svgDoc.documentElement, file.name );
    }
}

class UIButtonLoadJSON extends UIButtonLoad
{
    constructor(opts)
    {
        super(opts);
        this.fileInput.elmt().setAttribute("accept", ".json");
    }
}

class UICheckbox extends UIElement
{
    static id_switch = 0;

    constructor(opts={})
    {
        super("div", opts);
        this.class("checkbox-container");

        this.lbl            = UI.label().text( opts.label || "???" );
        let chk_control     = UI.div().class("checkbox-control");

        let chk_input_id    = `chk-${UICheckbox.id_switch}`; 
        this.chk_input      = UI.input("checkbox").id(chk_input_id);
        let chk_lbl         = UI.label({"attr" : {"for" : chk_input_id} });

        this
        .child( this.lbl )
        .child( chk_control.child(this.chk_input).child(chk_lbl) );

        UICheckbox.id_switch++;
    }

    label(s)
    {
        this.lbl.text(s);
        return this;
    }

    val(v)
    {
        let elmt = this.chk_input.elmt();
        if (arguments.length == 0)
            return elmt.checked;        
        else
        {
          elmt.checked = v;
        }
        return this;
    }


    change( cb )
    {
        this.chk_input.elmt().addEventListener("change", e=> cb.call(null, this.val() ) );
        return this;
    }

}

class UIContainerFoldable extends UIElement
{
    constructor(opts={})
    {
        super("div");
        this.class("container foldable");

        this.lbl = UI.label().text(opts.title ?? "Container foldable").class("underline");
        this.lbl.elmt().addEventListener("click", e=> this.toggle());

        this.container = UI.div().class("container");
        this.bOpened = true;

        this.child( [this.lbl,this.container] );
//        this.opts = opts;
    }

    close()
    {
        this.bOpened = false;
        this.container.hide();
    }

    toggle()
    {
        this.bOpened = !this.bOpened;
        if (this.bOpened)
            this.container.show();
        else 
            this.container.hide();

//        if (this.opts.cbToggle)            
  //          this.opts.cbToggle();
    }

    
    child_(elmt)
    {
        if (elmt)
        {
            if (Array.isArray(elmt))
                elmt.forEach( e => this.container.child(e) );
            else
                this.container.appendChild(elmt);
        }
        return this;
    }

}

class UISlider extends UIElement
{
    constructor(opts={})
    {
        super("div", {"class":"range-container"});

        this.bDisplayLabelValue     = true;
        this.bDisplayBubbleValue    = true;


        this.lbl            = UI.label().text( opts.label || "" );
        this.label          = this.lbl.elmt().innerHTML; 
        this.inputRange     = UI.input("range").class("slider").attr(opts);

        // See : https://css-tricks.com/value-bubbles-for-range-inputs/
        this.bubble         = UI.element("output").class("bubble");
        this.bubble.hide();

        this.lblMin         = UI.div().class("lbl-slider-min").text(`${+(opts.min).toFixed(2)??"?"}`);
        this.lblMax         = UI.div().class("lbl-slider-max").text(`${+(opts.max).toFixed(2)??"?"}`);

        this.min            = +(opts.min);
        this.max            = +(opts.max);

        this.hideName       = opts.hideName != undefined ? opts.hideName : false;
        if (this.hideName)
            this.lbl.hide();

        this
        .child( this.lbl )
        .child
        (
            UI.div().class("control flex slider-bar")
                .child( this.lblMin  )
                .child( this.inputRange )
                .child( this.lblMax )
                .child( this.bubble )
        );
       
        this.addEventListener("input", value=>
        {
            this.updateLabelValue( +(value) );
        });

        this.addEventListener("change", value=> this.bubble.hide());
        //this.updateLabelValue( value );
        this.noDisplayBubbleValue(); // default
    }

    noDisplayLabelValue()
    {
        this.bDisplayLabelValue = false;
        return this;

    }

    noDisplayBubbleValue()
    {
        this.bDisplayBubbleValue = false;
        return this;

    }    

    displayColumns()
    {
        this.addClass("columns");
        return this;
    }

    change(cb)
    {
        this.addEventListener("change", e => cb.call(null, this.inputRange.elmt().value ));
        return this;
    }

   addEventListener(eventName, cb)
   {
        this.inputRange.elmt().addEventListener(eventName, e=> cb.call(null, this.val()/*this.inputRange.elmt().value*/ ) );
   }

   step(s)
   {
    this.inputRange.attr( {"step" : s} );
    return this;
   }
    
   updateLabelValue(value)
   {
        if (this.lbl && this.bDisplayLabelValue)
        {
            let v = value.toFixed(2);
            let s = (this.hideName == false && this.label) != "" ? (this.label + " - " + v) : v;
            this.lbl.text(s)
        }

        if (this.bubble && this.bDisplayBubbleValue)
        {
            this.bubble.show();

            let norm = (+(value) - this.min)/(this.max-this.min);
            let handleW = 20;
            let lblMinW = this.lblMin.elmt().offsetWidth;
            let rangeW = this.inputRange.elmt().offsetWidth - handleW;

            this.bubble.elmt().innerHTML = value;
            this.bubble.elmt().style.left = `${lblMinW + handleW/2 + norm*rangeW}px`; // super empiric : lblMin.width + handleWidth

            this.bubble.elmt().style.top = "21px";
            this.bubble.elmt().style.zIndex=1000;
        }
    }

    val(v)
    {
        if (v)
        {
            this.inputRange.elmt().value = v;
            this.updateLabelValue(v);
        }
        else 
            return this.inputRange.elmt().value;
    }
    
}

class UITextInput extends UIElement
{
    constructor(opts={})
    {
        super("div", opts);
        this.class("text-input");

        this.lbl            = UI.label().text( opts.label || "???" );
        this.te             = UI.input("text", opts);

        this
        .child( this.lbl )
        .child( this.te )
    }

    label(s)
    {
        this.lbl.text(s);
        return this;
    }

    change( cb )
    {
        this.te.elmt().addEventListener("change", ()=>cb(this.val()));
      return this;
    }


    val(v)
    {
        let elmt = this.te.elmt();
        if (arguments.length == 0)
            return elmt.value;        
        else
            elmt.value = v; 
        return this;
    }
}

class UISliderRange extends UIElement
{
    // https://github.com/w3collective/price-range-slider
    // opts.range = []
    // opts.rangeValue = []
    // opts.rangeValueDeltaMin
    // opts.step = 1;
    constructor(opts={})
    {
        super("div", {"class":"range-container"});

        // Values
        this.range                  = opts.range??[0,1];
        this.rangeValueDeltaMin     = opts.rangeValueDeltaMin??0.1;
        this.step                   = opts.step??0.1;

        let rangeValue              = opts.value??[0,1];

        // Label
        this.lblTxt                 = opts.label || "";
        this.lbl                    = UI.label().text(this.lblTxt );

        // Range + Selection
        this.divRangeSlider         = UI.div().class("range-slider");
        this.spanRangeSelected      = UI.element("span").class("range-selected");
        this.divRangeSlider.child([this.spanRangeSelected])

        // Actual input sliders
        let optsInput               = {'min':this.range[0],'max':this.range[1],'step':this.step}
        this.divRangeInput          = UI.div().class("range-input");
        this.inputRangeForMin       = UI.input("range").class("min").attr(optsInput);
        this.inputRangeForMax       = UI.input("range").class("max").attr(optsInput);
        this.divRangeInput.child([this.inputRangeForMin,this.inputRangeForMax])
    
        this.lblMin = UI.div().class("lbl-slider-min").text(`${this.formatNumber(this.range[0])}`);
        this.lblMax = UI.div().class("lbl-slider-max").text(`${this.formatNumber(this.range[1])}`)

        this.containerRanges = UI.div({'class':'flex-1'});
        this.containerRanges.child([this.divRangeSlider,this.divRangeInput]);

        this
        .child( this.lbl )
        .child
        (
            UI.div().class("control flex slider-bar")
                .child( this.lblMin  )
                .child( this.containerRanges )
                .child( this.lblMax )
        )


        this.rangeInput = [this.inputRangeForMin.elmt(),this.inputRangeForMax.elmt()];
        this.val( rangeValue );

        this.rangeInput.forEach( input => input.addEventListener("input", e => this.updateLayout(e) ) )
        this.updateLayout();
    }

    setRange(range)
    {
        this.range = range;   
        this.lblMin.text( `${this.formatNumber(this.range[0])}` ); 
        this.lblMax.text( `${this.formatNumber(this.range[1])}` ); 
        this.updateLabelValue();
    }

    updateLayout(e)
    {
        let rangeValueMin   = +(this.rangeInput[0].value);
        let rangeValueMax   = +(this.rangeInput[1].value);
        let rangeDelta      = this.range[1] - this.range[0];
        let rangeSelected   = this.spanRangeSelected.elmt();

        if (e && ( (rangeValueMax - rangeValueMin) < this.rangeValueDeltaMin)) 
        {
            if (e.target.className === "min") {
                this.rangeInput[0].value = this.rangeInput[1].value - this.rangeValueDeltaMin;
              } else {
                this.rangeInput[1].value = this.rangeInput[0].value + this.rangeValueDeltaMin;
              }
        }

        rangeSelected.style.left     = ((this.rangeInput[0].value - this.range[0]) / rangeDelta) * 100 + "%";
        rangeSelected.style.right    = (1 - (this.rangeInput[1].value-this.range[0]) / rangeDelta) * 100 + "%";
    
        this.updateLabelValue();
    }

    updateLabelValue()
    {
        let v = this.val();
        this.lbl.text( `${this.lblTxt} - [${this.formatNumber(v[0])},${this.formatNumber(v[1])}]` )
    }


    val(v)
    {
        if (v)
        {
            this.rangeInput[0].value  = +(v[0]);
            this.rangeInput[1].value  = +(v[1]);

            this.updateLayout();
        }
        else
        {
            return [+this.rangeInput[0].value, +this.rangeInput[1].value];
        }
    }

    change(cb)
    {
        this.rangeInput.forEach( input => input.addEventListener("change", e => cb.call(null, this.val() )) );
        return this;
    }
    
    step(s)
    {
        this.rangeInput.forEach( input => input.step=s );
        return this;
    }
    
    formatNumber(n)
    {
        return (+(n)).toFixed(2)??"?";
    }

    enable(is=true)
    {
        this.lbl.elmt().style.opacity = is ? 1.0 : UI.OPACITY_DISABLED;
        this.lblMin.elmt().style.opacity = is ? 1.0 : UI.OPACITY_DISABLED;
        this.lblMax.elmt().style.opacity = is ? 1.0 : UI.OPACITY_DISABLED;
        this.containerRanges.elmt().style.opacity = is ? 1.0 : UI.OPACITY_DISABLED;
        this.spanRangeSelected.elmt().style.opacity = is ? 1.0 : UI.OPACITY_DISABLED;
        this.inputRangeForMin.elmt().disabled = !is;
        this.inputRangeForMax.elmt().disabled = !is;
        return this;
    }
}



import template from './logger.html'

//See: https://github.com/brainsatplay/domelement
export class LoggerDiv extends HTMLElement {


    messages=[];
    messagedivs=[];
    maxMessages=5; //max messages in div
    _scrollable=false;
    div=undefined;

    constructor() {
        super();
        
    }

    connectedCallback() {
        this.innerHTML = template;
    }

    get scrollable() {
        return this._scrollable;
    }

    set scrollable(bool) {
        this._scrollable = bool;
        const table = this.querySelector('table'); //table
        if(table) table.style.overflow = bool ? '' : 'hidden';
    }

    log = (
        message,  //the message
        templateString=`<tr><td>{{message}}</td></tr>` //can apply template string, use {{message}} to indicate a replacer
    ) => {

        const t = document.createElement('template');
        t.innerHTML = templateString.replaceAll('{{message}}',message);
        const fragment = t.content;

        if(!this.div) {     
            this.div = this.querySelector('table');
            if(!this._scrollable) this.div.style.overflow = 'hidden';
        }

        if(this.messages.length >= this.maxMessages) {
            this.messages.shift();
            this.messagedivs[0].remove();
            this.messagedivs.shift();
        }
        
        this.messages.push(message);

        this.div.appendChild(fragment);

        let children = this.querySelectorAll('tr');
        this.messagedivs.push(children[children.length-1]);

        const len = this.messagedivs.length;
        if(len+2 >= this.maxMessages) {
            if(this.messagedivs[this.maxMessages-3]) {
                if(len === this.maxMessages)
                    this.messagedivs[0].style.opacity = '0.25'; //add some fade out                }
            }
            if(this.messagedivs[this.maxMessages-2]) {
                if(len === this.maxMessages) {
                    this.messagedivs[1].style.opacity = '0.5'; 
                } else {    
                    this.messagedivs[0].style.opacity = '0.5';
                }
            }
            if (len === this.maxMessages) {
                this.messagedivs[2].style.opacity = '0.75';
            }
            else if(len+1 >= this.maxMessages) {
                this.messagedivs[1].style.opacity = '0.75'; 
            } else{
                this.messagedivs[0].style.opacity = '0.75';
            } 
        }

    }
    

   

}

//window.customElements.define('custom-', Custom);

customElements.define('log-table', LoggerDiv);


//Global selection and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn =  document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const lockButton = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.slider');
let initialColors;
//This is for local storage
let savedPaletts = [];
//Add our EventListener
generateBtn.addEventListener('click',randomColors);
sliders.forEach(slider =>{
    slider.addEventListener('input',hslControls);
});
colorDivs.forEach((div,index)=>{
    div.addEventListener("change",()=>{
        updateTextUi(index);
    });
});
currentHexes.forEach(hex =>{
    hex.addEventListener("click", () =>{
        copyToClipboard(hex);
    });
});
popup.addEventListener('transitionend', ()=>{
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});
adjustButton.forEach((button,index) =>{
    button.addEventListener('click',()=>{
        openAdjustmentPanel(index);
    });
});
closeAdjustments.forEach((button,index)=>{
    button.addEventListener('click',() =>{
        closeAdjustmentPanel(index);
    });
});
//Functions
//Color generator
function generateHex(){
    const hexColor = chroma.random();
    return hexColor;
}


function randomColors(){
    //
    initialColors=[];
    colorDivs.forEach((div)=>{
    const hexText = div.children[0];
    const randomColor = generateHex();
    //Add it to array
    if(div.classList.contains("locked")){
        initialColors.push(hexText.innerText);
        return;
    }else{
        initialColors.push(chroma(randomColor).hex()); 
    }
    //Add color to background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //Check the contrast
    checkTextContrast(randomColor,hexText);
    //Initial Colorize Sliders
    const color = chroma(randomColor);
    const slider = div.querySelectorAll(".slider input");
    const heu = slider[0];
    const brightness = slider[1];
    const saturation = slider[2];

    colorizeSliders(color,heu,brightness,saturation);
    });
    //Reset inputs
    resetInputs();
    //Check for button contrast
    adjustButton.forEach((button,index)=>{
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButton[index]);        
    });
}

function checkTextContrast(color,text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    }else{
        text.style.color = "white";
    };
}

function colorizeSliders(color,heu,brightness,saturation){
    //Scale saturation
    const noSat = color.set('hsl.s',0);
    const fullSat = color.set('hsl.s',1);
    const scaleSat = chroma.scale([noSat,color,fullSat]);
    //Bright Scale
    const midBright = color.set('hsl.l',0.5);
    const scaleBright = chroma.scale(["black",midBright,"white"]);

    //Update Input Color
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
    heu.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e){
    const index = e.target.getAttribute("data-bright")||
    e.target.getAttribute("data-sat")||
    e.target.getAttribute("data-heu");
    

    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const heu = sliders[0];
    const saturation = sliders[1];
    const brightness = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', heu.value);

    colorDivs[index].style.backgroundColor = color;
    //Colorized input/sliders
    colorizeSliders(color,heu,brightness,saturation);
}

function updateTextUi(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    //Check contrast Text
    checkTextContrast(color,textHex);
    for(icon of icons){
        checkTextContrast(color,icon);
    }
}
function resetInputs(){
    const sliders = document.querySelectorAll('.slider input');
    sliders.forEach(slider =>{
        if(slider.name === "heu" ){
            const heuColor = initialColors[slider.getAttribute("data-heu")];
            const heuValue = chroma(heuColor).hsl()[0];
            slider.value = Math.floor(heuValue);
        }
        if(slider.name === "brightness" ){
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100)/100;
        }
        if(slider.name === "saturation" ){
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[2];
            slider.value = Math.floor(satValue * 100)/100;
        }
        
    });
}
function copyToClipboard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    //Pop up animation
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}
function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove('active');
}
function lockLayer(e, index){
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle('locked');

    if (lockSVG.classList.contains("fa-lock-open")){
        e.target.innerHTML = '<i class="fas fa-lock"></i>';
    }else{
        e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}
//Implement save to palettes and local storage
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const saveContainer = document.querySelector('.save-container');
const closeSave = document.querySelector('.close-save');
const saveInput = document.querySelector('.save-container input');
const libraryBtn = document.querySelector('.library');
const libraryContainer = document.querySelector('.library-container');
const closeLibraryBtn = document.querySelector('.close-library');

//Event listener
saveBtn.addEventListener('click',openPalette);
closeSave.addEventListener('click',closePalette);
submitSave.addEventListener('click',savePalette);
function openPalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}
function closePalette(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.add('remove');
}
function savePalette(e){
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name =saveInput.value;
    const colors = [];
    currentHexes.forEach(hex =>{
        colors.push(hex.innerText);
    });
    //Generate object
    let paletteNr = savedPaletts.length;
    const paletteObj ={name, colors, nr: paletteNr};
    savedPaletts.push(paletteObj);
    //Save to local storage
    savetoLocal(paletteObj);
    saveInput.value ="";
    //Generate palette for Library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor =>{
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-button');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = 'Select';

    //Attach event to the btn
    paletteBtn.addEventListener('click', e =>{
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color,index) =>{
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUi(index);
        });
        resetInputs();
    });

    //Append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}
function savetoLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes')=== null){
        localPalettes=[];
    }else{
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes',JSON.stringify(localPalettes));
}
function openLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}
function closeLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal(){
    if(localStorage.getItem('palettes')=== null){
        localPalettes =[];
    }else{
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        paletteObjects.forEach(paletteObj =>{
            //Generate palette for Library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor =>{
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-button');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = 'Select';

    //Attach event to the btn
    paletteBtn.addEventListener('click', e =>{
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color,index) =>{
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUi(index);
        });
        resetInputs();
    });

    //Append to Library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
        });
    }
}
getLocal();
randomColors();
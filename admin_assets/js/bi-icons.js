
let allBiIconsDiv;
let biIcons;
var containerElement = document.querySelector('#icons');
var serachIconInput = document.querySelector('#iconsSearchInput');

//document.addEventListener('DOMContentLoaded', function () {
    var classesFromCss = document.querySelector('link[href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.2/font/bootstrap-icons.min.css"]');
    console.log('classesFromCss', classesFromCss, containerElement, serachIconInput)
    fetch(classesFromCss.href)
        .then(response => response.text())
        .then(cssText => {
            const classNames = cssText.match(/\.[a-zA-Z0-9_-]+/g);
            const uniqueClassNames = Array.from(new Set(classNames));
            biIcons = uniqueClassNames.map(function (item) {
                return item.substring(1); // remove the first character (the dot)
            });
            generateElement(biIcons);
        });
//});

function generateElement(biIcons) {
    biIcons.forEach((biIcon, i) => {
        if (i > 3) {
            var newElement = document.createElement('div');
            newElement.classList.add('col-sm-6', 'col-md-4', 'col-lg-3', 'bi-icons');
            // newElement.innerHTML = `<div class="preview">
            //                             <div class="icon-preview">
            //                                 <i class="bi ${biIcon}"></i>
            //                             </div>
            //                             <div class="icon-class">bi ${biIcon}</div>
            //                         </div>
            //                         `;

            newElement.innerHTML=`<div class="card mb-15" id="iconCard">
                                    <div class="card-body ">
                                        <div class="d-flex align-items-center justify-content-between">
                                            <div class="d-flex align-items-center">
                                                <div class="me-3" >
                                                    <i class="bi ${biIcon} fs-18"></i>
                                                </div>
                                                <div class="d-flex flex-column fw-500">
                                                    <span class="icon-class">bi ${biIcon}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
            containerElement.appendChild(newElement);
            newElement.querySelector('#iconCard').addEventListener('click',function(){
                    document.getElementById('newModuleIcon').value = biIcon;
                    $('#IconModal').modal('hide');
            })
        }
    });
};

serachIconInput.addEventListener('keyup', () => {
    allBiIconsDiv = document.querySelectorAll('.bi-icons');
    searchValue = serachIconInput.value.toLowerCase();
    if (!searchValue) {
        allBiIconsDiv.forEach((biIconDiv) => { biIconDiv.classList.remove('hide'); });
    }
    checkKeywords(searchValue);
});

function checkKeywords(searchValue) {
    var words = searchValue.split("");
    if (words.length >= 3) {
        searchIcon(searchValue);
    }
    else {
        allBiIconsDiv.forEach((biIconDiv) => { biIconDiv.classList.remove('hide'); });
    }
};

function searchIcon() {
    allBiIconsDiv.forEach((biIconDiv) => {
        biIconDiv.classList.add('hide');
        var iconText = biIconDiv.querySelector('.icon-class').textContent;
        if (iconText.includes(searchValue)) {
            biIconDiv.classList.remove('hide');
        }
    });
};


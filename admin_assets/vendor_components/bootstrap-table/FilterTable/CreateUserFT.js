//let dataURL = '/SubjectMaster/GetSubjectData/';
getAPI();

const allData = [];
/************************************************************************** */
//change the name of local storage here and on line 107 and on line 133
const savedFiltersForTableID = JSON.parse(localStorage.getItem('savedFiltersForTableID')) || [];
async function getAPI() {
    const response = await fetch('/UserCreation/GetUserByOrganization/');
    var data = await response.json();
    allData.push(...data['data']);
    // console.log(allData)
    //console.table(data['data']);    
    // const table= addOptionForFiltering('filterTable');
    
    initializeCustomFilter('example',['User Name','Login Id','Mobile No.','Email Id','Gender','f','g','h','i','j','k','l','m','n','o','p'],savedFiltersForTableID);
   
    
}

/**
 * Initialize Table Start
 */

function initializeCustomFilter(tableID,actualColNames,savedFiltersForTableID){    
    
    
    const table = document.querySelector(`#${tableID}`);
    const tableToolBar = table.closest('.table-responsive').querySelector('.tableToolbarLeft');
    //make dynamic filters
    makeDynamicFilters(tableID,tableToolBar);
    //make the saved filters 
    makeSavedFilters(tableID,tableToolBar);
    populateFilters(tableID);
    //toggle the export all and choose the options for the exporting
    //makeExportOption(tableID,tableToolBar);
    initializeExportAll(tableID);


    const addOptionsBtn = document.querySelector(`[data-options-for-filter-table='${tableID}'] i`);
    const sortTable = document.querySelector(`[data-sort-table-id='${tableID}']`);
    const placeToAddOptions = document.querySelector(`[data-options-for-filter-table='${tableID}']`);

    saveTheFilters(tableID,placeToAddOptions,savedFiltersForTableID);

    const colNames = getColumnNames(table,actualColNames);
    const firstColumnData = getFirstColumnValues(table);
    makeOption(tableID,placeToAddOptions,colNames,firstColumnData);

    addOptionsBtn.addEventListener('click',()=>{
        makeOption(tableID,placeToAddOptions,colNames,firstColumnData);
    });
    sortTable.addEventListener('click',()=>{
        filterTable(tableID,placeToAddOptions);
        //  tableID.remove('hide');
        //tableID.style.display='none';
        //document.querySelector(`[data-sort-table-id='${tableID}']`).setAttribute('data-dismiss', 'modal');
        // document.querySelector(`[id='filterTableFor-${tableID}']`).classList.add('hide');
        $(`#filterTableFor-${tableID}`).modal('hide');
    })
    // console.log(table,addOptionsBtn,sortTable)
}
//END


/** 
 * <!-- filter data table -->

*/

/*
* Make Dynamic FIlter for the table
*/ 
function makeDynamicFilters(tableID,tableToolBar){
    const filterElement = document.createElement('span');
    filterElement.innerHTML = `
    <button type="button" class="btn filterTableBtn" data-toggle="modal" data-target="#filterTableFor-${tableID}">
        <i class="fa fa-filter F-A"></i> Filter
    </button>
    `;
    tableToolBar.appendChild(filterElement);
    makeModalForFIlterTable(tableID);
}
//END


/*
* Save The Filters
 */

function saveTheFilters(tableID,placeToAddOptions,savedFiltersForTableID){
    const saveFilterBtn = document.querySelector(`[data-save-filter-as='${tableID}']`);
    saveFilterBtn.addEventListener('click',()=>{
        let filterName = document.querySelector(`[data-save-filter-name='${tableID}']`).value;
        //console.log(filterName);
        let result = filterTable(tableID,placeToAddOptions);
        const list = document.querySelector(`[aria-labelledby="savedFilterForTable-${tableID}"]`);    
        
        
        const resultNamePair = {
            filterName,
            result
        }
        //console.log(typeof result);
        /************************************************************************** */
        //change the name of local storage here
        savedFiltersForTableID.push(resultNamePair);
        localStorage.setItem(`savedFiltersForTableID`, JSON.stringify(savedFiltersForTableID));
        list.innerHTML=``;
        populateFilters(tableID);
        
    });
}

function populateFilters(tableID){
    // console.log(savedFiltersForTableID);
    const list = document.querySelector(`[aria-labelledby="savedFilterForTable-${tableID}"]`);
    list.innerHTML=``;
    savedFiltersForTableID.map(obj => {
        // console.log(obj);
        const savedFilter = document.createElement('li');
        savedFilter.innerHTML = `
            <a class="dropdown-item " data-saved-filter='${obj.filterName}'  href="#">${obj.filterName}<i class="fa fa-trash text-danger F-A deleteFilter"></i></a>
        `;
        const clickElement = savedFilter.querySelector(`[data-saved-filter='${obj.filterName}']`);
        clickElement.addEventListener('click',()=>{
            $(function() {
                var $table = $(`#${tableID}`)
                $table.bootstrapTable('filterBy', obj.result);          
            })
        });
        const deleteElement = savedFilter.querySelector('.deleteFilter');
        deleteElement.addEventListener('click',()=>{
            savedFilter.remove()
            /************************************************************************** */
            //change the name of local storage here
            const updatedArray = savedFiltersForTableID.filter(removeObj => removeObj.filterName !==`${obj.filterName}`);
            //console.log(updatedArray);
            localStorage.setItem(`savedFiltersForTableID`, JSON.stringify(updatedArray));
            list.innerHTML=``;
            populateFilters(tableID);
        });

        list.appendChild(savedFilter)

        
    });
    
}

/**
 * Modal for filtering the table
 * 
 */
function makeModalForFIlterTable(tableID){
    const modal = document.createElement('span');
    modal.innerHTML = `
    <div class="modal fade" id="filterTableFor-${tableID}" tabindex="-1" aria-labelledby="filterTableModal" aria-hidden="true" data-backdrop="true" >
        <div class="modal-dialog modal-fullscreen-lg-down  ">
            <div class="modal-content">
                <div class="modal-header">
                  
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true" style='font-size:25px;'>&times;</span>
                    </button>
                      <h5 class="modal-title" id="filterTableModal">Filter Table</h5>
                </div>
                <!-- add the class name with the table id here -->
                <div class="modal-body" data-options-for-filter-table='${tableID}'>
                
                    <i class="fa fa-plus fa-pull-right text-primary"></i>
                    <br>
                </div>

                <div class='saveFilter'>
                    <span>Save Filter As</span>
                    <input type="text" data-save-filter-name='${tableID}' id='filterName'>
                </div>
                <div class="modal-footer">
                    <button type="button" data-save-filter-as='${tableID}' class="btn btn-success">+ Save Filter</button>
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                    <!-- also add the close button to work with the same table id -->
                    <button type="button" class="btn btn-primary" data-sort-table-id='${tableID}'>Apply</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.body.appendChild(modal);
}
//END




/**
 * Make the Saved filters for the table
 * */ 
function makeSavedFilters(tableID,tableToolBar){
    const element = document.createElement('div');
    element.classList.add('dropdown','saved-filters');
    element.id = `${tableID}-saved-filters`;
    element.innerHTML = `
        <button class="btn dropdown-toggle savedFilters" type="button" id="savedFilterForTable-${tableID}" data-toggle="dropdown" aria-expanded="false">
        Previous Filters <span class="caret"></span>
        </button>
        <ul class="dropdown-menu savedFilterListUL" aria-labelledby="savedFilterForTable-${tableID}">
            
        </ul>
    `; 
    tableToolBar.appendChild(element);
}
//END




/**
 * Make Select Options for the main table
*/
function makeExportOption(tableID,tableToolBar){
    const select = document.createElement('select');
    select.classList.add('btn','selectExport');
    select.id=`${tableID}-export-select`;
    select.innerHTML = `
        <option value="all">Export All</option>
        <option value="selected">Export Selected</option>
    `;

    var $table = $(tableID);
    //   var toolbar = table.closest('.table-responsive').querySelector('.tableToolabarLeft');
    $(function() {
        
        $(`${tableID}-export-select`).change(function () {
            $table.bootstrapTable('destroy').bootstrapTable({
                exportDataType: $(this).val(),
                exportTypes: ['json','csv', 'txt', 'pdf','doc','excel'],
                columns: [
                  {
                      field: 'chekstate',
                      checkbox: true,
                  
                      visible: $(this).val() === 'selected'
                  },
                
                ]
            })
        }).trigger('change')
    })


    tableToolBar.appendChild(select);
}
//END








/**
 * Make the initial options colname and the first dataset Start
 */
function getFirstColumnValues(){    
    const values = allData
                        .map(obj => obj[`${Object.keys(allData[0])[0]}`])
                        .filter((value, index, self) => self.indexOf(value) === index);
    return values.map(value => `<option value='${value}'>${value}</option>`).join('');
}

function getColumnNames(table,actualColNames){    
    const nameArray = Object.keys(allData[0]);
    const optionNameArray = nameArray.map((name,i) => `<option value='${name}'>${actualColNames[i]}</option>`);
    return optionNameArray.join('');
}
//END



/**
 * Make the options for the table Start
 */
function makeOption(tableID,placeToAddOptions,colNames,firstColumnData){
    
    const newOption = document.createElement('div');
    newOption.classList.add('filterOption');
    newOption.innerHTML = `
        <label class='colNameLabel' for='colName'>Column Name
        <select class="colName" >
            <!--<option value="default">Select One</option>-->
            ${colNames}
        </select></label>


        <label for='operator'>Operator
        <select class='operator'>
            <option value="==">Equal to</option>
            <option value='range'>Range</option>
            <option value="<"><</option>
            <option value="<="><=</option>
            <option value=">">></option>
            <option value=">=">>=</option>
          <!-- <option value="!=">Not equal to</option> -->
        </select></label>


        <label class='select-column-vals' for='columnValues'>Value
            <select class='optionsForColumn'>
                ${firstColumnData}
            </select>
        </label>


        <div class="input-container hide">
            <label for='valueToSearchFrom'>Value to Search
                <input type="number"  class="valueToSearchFrom"  />
            </label>
            <label for='valueToSearchTo'>
                <input type='number' name='' class='valueToSearchTo' placeholder='To'/>
            </label>
        </div>



        <i class="fa fa-times text-center minusInFilter"></i>
    `;
    // cross to remove the filter
    const cross = newOption.querySelector('.minusInFilter');
    cross.addEventListener('click', ()=>{
        newOption.remove();
    });

    //toggle select options 
    const optionsSelect = newOption.querySelector('.operator');
    const allColumnDropdowns = newOption.querySelector('.select-column-vals');
    const inputContainer = newOption.querySelector('.input-container');
    const optionsForSelect = newOption.querySelector('.optionsForColumn');
    optionsSelect.addEventListener('change',()=>{
        toggleOptions(optionsSelect,allColumnDropdowns,inputContainer);
    });

    //select 2 options for all the select 2 multi selects    
    const select2Options ={
        dropdownParent: $( `#filterTableFor-${tableID}`),
        theme: "material",
        width:240,
        multiple:true,
        placeholder:'Select...',
        //dropdownAdapter: $.fn.select2.amd.require('select2/selectAllAdapter'),
    }
    //columnName toggle the values on the right
    const columnNameSelect = newOption.querySelector('.colName');
    let rightSideValues ;
    columnNameSelect.addEventListener('change',()=>{
        rightSideValues = toggleRightSideValues(columnNameSelect);
        optionsForSelect.innerHTML =`${rightSideValues}`;
        $(optionsForSelect).select2("destroy").select2(select2Options);
    });

    //make the right side options multiselect
    $(optionsForSelect).select2(select2Options);


    // append the list to the container
    placeToAddOptions.appendChild(newOption);
}
//Make the options for the table END





/**
 * Toggle Right Dropdown values  Start
 */
function toggleRightSideValues(columnNameSelect){
    const columnName = columnNameSelect.value;
    const values = allData
                        .map(obj => obj[`${columnName}`])
                        .filter((value, index, self) => self.indexOf(value) === index);
    // console.log(values)
    return values.map(value => `<option value=${value}>${value}</option>`).join('');
}
//Toggle Right Dropdown values END

/**
 * Options Toggle Start
 */
function toggleOptions(optionsSelect,allColumnDropdowns,inputContainer){
    if(optionsSelect.value ==='=='){        
        allColumnDropdowns.classList.remove('hide');
        inputContainer.classList.add('hide');       
    }
    else if (optionsSelect.value === 'range'){
        hideColumnDropdown(allColumnDropdowns,inputContainer);
        showRangeTo(inputContainer);
    }
    else{
        hideColumnDropdown(allColumnDropdowns,inputContainer);
        hideRangeTo(inputContainer);
    }
    
}

function hideColumnDropdown(allColumnDropdowns,inputContainer){
    allColumnDropdowns.classList.add('hide');
    inputContainer.classList.remove('hide');
}

function showRangeTo(inputContainer){    
    inputContainer.querySelector('.valueToSearchFrom').placeholder='From';
    inputContainer.querySelector(`[for='valueToSearchTo']`).style.display='block';
}

function hideRangeTo(inputContainer){
    inputContainer.querySelector('.valueToSearchFrom').placeholder='';
    inputContainer.querySelector(`[for='valueToSearchTo']`).style.display='none';
}

// Options Toggle END 




/*
*Filter table start
*/ 
function filterTable(tableID,placeToAddOptions){
    const allIndividualFilters = placeToAddOptions.querySelectorAll('.filterOption');
    // console.log(allIndividualFilters)
    const columnNameCheck=[];
    const list = [...allIndividualFilters].map(filterDiv=>{
        // console.log('div is',filterDiv);
        const slectedValue = $(filterDiv).find('.optionsForColumn').val();
        const colName = filterDiv.querySelector('.colName').value;
        const operator = filterDiv.querySelector('.operator').value;
        const parameter = filterDiv.querySelector('.valueToSearchFrom').value;
        const parameterTo = filterDiv.querySelector('.valueToSearchTo').value;
        const parameterList = [];
        if(columnNameCheck.includes(colName)){
            alert('Please make sure the column names for sorting are unique!!!');
            return;
        }
        columnNameCheck.push(colName);
        if(operator==='=='){
            //choose the selects here and then the values 
            slectedValue.map(val=>parameterList.push(val));
            // console.log('==',slectedValue);
        }
        else if(operator==='range'){
            for(let i=Number(parameter);i<=parameterTo;i++){
                parameterList.push(i);
            }
        }
        else if(operator==='<='){            
            let filteredArray = allData.map(obj => obj[`${colName}`]);           
            let i = Math.min( ... filteredArray);
            for(i;i<=parameter;i++){
                parameterList.push(i);
                
            }
        }
        else if(operator==='>'){
            let filteredArray = allData.map(obj => obj[`${colName}`]);           
            let i = Math.max( ... filteredArray);
            for(i;i>parameter;i--){
                parameterList.push(i);
            }
        }
        else if(operator==='>='){
            let filteredArray = allData.map(obj => obj[`${colName}`]);           
            let i = Math.max( ... filteredArray);
            for(i;i>=parameter;i--){
                parameterList.push(i);
            }
        }
        else if(operator==='<'){
            let filteredArray = allData.map(obj => obj[`${colName}`]);           
            let i = Math.min( ... filteredArray);
            for(i;i<parameter;i++){
                parameterList.push(i);
            }
        }
        return {colName,parameterList};
    })
    // form an object to feed to the filter function
    var result = {};
    for (var i = 0; i < list.length; i++) {
        result[list[i].colName] = list[i].parameterList;
    }
    // console.log('result',result);
    //feed the result to the filter by function of bootstrap table
    $(function() {
        var $table = $(`#${tableID}`)
        $table.bootstrapTable('filterBy', result);          
    })
    return result;
}
//Filter table END




/**
 * Initialize the Selected Value in the table
*/
function initializeExportAll(tableID){
    var $table = $(`#${tableID}`);
    var toolbar = document.querySelector(`#${tableID}`).closest('.table-responsive').querySelector('.tableToolbarLeft');
    $(function() {        
        $(toolbar).find('select').change(function () {
            $table.bootstrapTable('destroy').bootstrapTable({
                exportDataType: $(this).val(),
                exportTypes: ['json','csv', 'txt', 'pdf','doc','excel'],
                columns: [
                {
                    field: 'chekstate',
                    checkbox: true,
                    visible: $(this).val() === 'selected'
                },
            
                ]
            })
        }).trigger('change')
    })
}
//END



/*
* Custom placeholder for searching inside the dropdown
* use it with the option  >> searchInputPlaceholder: 'placeholder here',<< inside the select2 options
*/

//(function($) {

//    var Defaults = $.fn.select2.amd.require('select2/defaults');

//    $.extend(Defaults.defaults, {
//       // searchInputPlaceholder: ''
//    });

//    var SearchDropdown = $.fn.select2.amd.require('select2/dropdown/search');

//    var _renderSearchDropdown = SearchDropdown.prototype.render;

//    SearchDropdown.prototype.render = function(decorated) {

//        // invoke parent method
//        var $rendered = _renderSearchDropdown.apply(this, Array.prototype.slice.apply(arguments));

//        this.$search.attr('placeholder', this.options.get('searchInputPlaceholder'));

//        return $rendered;
//    };

//    })(window.jQuery);

//END




/**
 * Select 2 Select all and unselect all
*/

/* <script src='../src/Select2/select-all.js'></script> */
// only works for select2 v4.0.0
//$.fn.select2.amd.define('select2/selectAllAdapter', [
//    'select2/utils',
//    'select2/dropdown',
//    'select2/dropdown/attachBody'
//], function (Utils, Dropdown, AttachBody) {

//    function SelectAll() { }
//    SelectAll.prototype.render = function (decorated) {
//        var self = this,
//            $rendered = decorated.call(this),
//            $selectAll = $(
//                '<button class="btn btn-xs btn-default select2-header-btn " type="button" style="margin-left:6px;"><i class="fa fa-check-square-o"></i> Select All</button>'
//            ),
//            $unselectAll = $(
//                '<button class="btn btn-xs btn-default select2-header-btn " type="button" style="margin-left:6px;"><i class="fa fa-square-o"></i> Unselect All</button>'
//            ),
//            $btnContainer = $('<div class="select2-selectAll-container" style="margin-top:3px;">').append($selectAll).append($unselectAll);
//        if (!this.$element.prop("multiple")) {
//            // this isn't a multi-select -> don't add the buttons!
//            return $rendered;
//        }
//        $rendered.find('.select2-dropdown').prepend($btnContainer);
//        $selectAll.on('click', function (e) {
//            var $results = $rendered.find('.select2-results__option[aria-selected=false]');
//            $results.each(function () {
//                self.trigger('select', {
//                    data: $(this).data('data')
//                });
//            });
//            self.trigger('close');
//        });
//        $unselectAll.on('click', function (e) {
//            var $results = $rendered.find('.select2-results__option[aria-selected=true]');
//            $results.each(function () {
//                self.trigger('unselect', {
//                    data: $(this).data('data')
//                });
//            });
//            self.trigger('close');
//        });
//        return $rendered;
//    };

//    return Utils.Decorate(
//        Utils.Decorate(
//            Dropdown,
//            AttachBody
//        ),
//        SelectAll
//    );

//});

/*
  adapter could have been defined elsewhere in a global includes script or whereever
  we can now use it elsewhere
  this can also be applied to non-multi-selects (the buttons won't be added)
*/
//END
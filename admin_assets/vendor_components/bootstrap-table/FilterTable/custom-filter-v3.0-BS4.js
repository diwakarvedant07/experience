
const allData = [];
/************************************************************************** */
//change the name of local storage here and on line 107 and on line 133
//const savedFiltersForTableID = JSON.parse(localStorage.getItem('savedFiltersForTableID')) || [];
//async function getAPI() {
//    const response = await fetch('/SubjectMaster/GetSubjectData/');
//    var data = await response.json();
//    allData.push(...data['data']);
//    // console.log(allData)
//    // console.table(data['data']);    
//    // const table= addOptionForFiltering('filterTable');
//   // console.table(allData);
//    //table name , column names to show in select , columnsNames from procedure to display
//    initializeCustomFilter(
//        'tblsubject',
//        ['Course ID', 'Course Code', 'Course Name', 'Course Short Name',
//        'Course Credits', 'Course Category', 'Course Type', 'Department', 'Status',], ['SubjectCode', 'SubjectName', 'SubjectShortName', 'SubjectCredit', 'SubjectCategory', 'SubjectTypeName', 'DepartmentName', 'Status']);
    
//}


/**
 * Initialize Pivot Table
 */
function initializePivotTable(tableID) {
    const table = document.querySelector(`#${tableID}`);
    const tableToolBar = table.closest('.table-responsive').querySelector('.tableToolbarLeft');
    const pivotTableElement = document.createElement('span');
    pivotTableElement.innerHTML = `
    <button type="button" class="btn btn-outline-info pivotTableBtn" data-bs-toggle="modal" data-bs-target="#pivotTableFor-${tableID}">
     <i class ="bi bi-bar-chart"></i>
        Pivot Table
    </button>
    `;
    tableToolBar.appendChild(pivotTableElement);
    makeModalForPivotTable(tableID);
    addPivotTableScripts();
}


/*
*Make the modal for the pivot table
*/
function addPivotTableScripts() {
    $(document).ready(function () {
        var derivers = $.pivotUtilities.derivers;
        var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.plotly_renderers);
        $("#pivotTable").pivotUI(allData, {
            renderers: renderers,
            rendererOptions: {
                plotly:
                {
                    width: 800,
                    height: 600,
                }
            },
            rowOrder: "value_a_to_z", colOrder: "value_z_to_a",
        });

        const downloadTable = document.querySelector('#downloadPivotTable');
        downloadTable.addEventListener('click', () => {
            $('#pivotTable .pvtTable').table2excel({
                name: "Backup file for Pivot Table",
                //  include extension also
                filename: "PivotTable.xls",
                // 'True' is set if background and font colors preserved
                preserveColors: false,
                exclude_img: true,
                exclude_links: true,
                exclude_inputs: true
            });
        });

        // Print the main table
        const printPivotTable = document.querySelector('#printPivotTable');
        printPivotTable.addEventListener('click', printInfo);
        function printInfo() {
            var divToPrint = document.querySelector("#pivotTable .pvtTable");
            newWin = window.open("", 'printwindow');
            newWin.document.write('<html><head><title>Pivot Table!</title><link rel="stylesheet" type="text/css" href="../scss/main.css"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"></head><body>');
            var tableStyle = `
            <style type="text/css"> 
            body{
                font-size:smaller;
                text-decoration:capitalize !important;
                font-weight:400 !Important;
            }
            table th, table td {
                border:1px solid #d6d6d6;
                padding:0em;
            }
            </style>`;
            newWin.document.write(tableStyle);
            newWin.document.write(divToPrint.outerHTML);
            newWin.document.write('</body></html>');
            newWin.print();
            newWin.close();
        }
        //add row and column
        const rowContainer = document.querySelector('.pvtAxisContainer.pvtRows.pvtUiCell.ui-sortable');
        const newRow = document.createElement('h6');
        newRow.classList.add('text-center', 'custom-row');
        newRow.textContent = 'Rows :';
        rowContainer.appendChild(newRow);

        const columnContainer = document.querySelector('.pvtAxisContainer.pvtHorizList.pvtCols.pvtUiCell.ui-sortable');
        const newColumn = document.createElement('h6');
        newColumn.classList.add('text-center', 'custom-column');
        newColumn.style.display = 'inline-block';
        newColumn.textContent = 'Columns :';
        columnContainer.appendChild(newColumn);

        //add the class for the buttons
        const allBtnInPivotTable = document.querySelectorAll('.pvtUi button[type="button"]');
        allBtnInPivotTable.forEach(btn => {
            if (btn.textContent === 'Select None') {
                btn.classList.add('btn', 'btn-outline-secondary', 'custom-orange-btn', 'btn-sm');
            }
            else if (btn.textContent === 'Cancel') {
                btn.classList.add('btn', 'btn-outline-danger', 'btn-sm');
            }
            else {
                btn.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'me-2')
            }
        });

        //add the type and setting name
        const typeContainer = document.querySelector('.pvtUiCell');
        const newType = document.createElement('h6');
        newType.textContent = 'Type :';
        typeContainer.prepend(newType);

        const parameterContainer = document.querySelector('.pvtVals.pvtUiCell');
        const newParameter = document.createElement('h6');
        newParameter.classList.add('text-start');
        newParameter.textContent = 'Values :';
        parameterContainer.prepend(newParameter);
    });
}

function makeModalForPivotTable(tableID) {
    const modal = document.createElement('span');
    modal.innerHTML = `
    <div class="modal fade" id="pivotTableFor-${tableID}" tabindex="-1" aria-labelledby="pivotTableLabel" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="pivotTableLabel">Pivot Table</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
            <div class="modal-body p-0">                
                <div id='pivotTable'></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary btn-sm " id="downloadPivotTable" >
                    <i class="material-icons-outlined top-1">
                    download_for_offline
                    </i>
                    Download
                </button>
                <a href="#" class="btn btn-outline-primary btn-sm" id="printPivotTable">
                    <i class="material-icons-outlined top-1">
                    print
                    </i>
                    Print
                </a>
                <button type="button" class="btn btn-outline-danger btn-sm" data-bs-dismiss="modal">Close</button>            
            </div>
            </div>
        </div>
    </div>    
    `;
    document.body.appendChild(modal);

}

/**
 * Initialize Table Start
 */



function initializeCustomFilter(tableID,actualColNames,showColumnNames){    
    
    //BSidharth Sir
    const table = document.querySelector(`#${tableID}`);
    const tableToolBar = table.closest('.table-responsive').querySelector('.tableToolbarLeft');
    //make dynamic filters
    /*makeDynamicFilters(tableID,tableToolBar);*/
    //make the saved filters 
    
    //toggle the export all and choose the options for the exporting
    //makeExportOption(tableID,tableToolBar);
    initializeExportAll(tableID);
    
    

    

    const colNames = getColumnNames(table, actualColNames, showColumnNames);
    const firstColumnData = getFirstColumnValues(table, showColumnNames);
    //filter table button
    const filterElement = document.createElement('span');
    filterElement.innerHTML = `
    <button type="button" class="btn btn-outline-success filterTableBtn" data-bs-toggle="modal" data-bs-target="#filterTableFor-${tableID}">
    <i class ="bi bi-funnel-fill F-A"></i>Filter
    </button>
    `;
    tableToolBar.appendChild(filterElement);
    makeModalForFIlterTable(tableID);
    
    const addOptionsBtn = document.querySelector(`[data-options-for-filter-table='${tableID}'] i`);
    const sortTable = document.querySelector(`[data-sort-table-id='${tableID}']`);
    const placeToAddOptions = document.querySelector(`[data-options-for-filter-table='${tableID}']`);
    saveTheFilters(tableID, placeToAddOptions);
    makeSavedFilters(tableID, tableToolBar);
    populateFilters(tableID);
    makeClearAllButton(tableID, tableToolBar);
    //end
    document.querySelector('.filterTableBtn').addEventListener('click', () => {
        makeOption(tableID, placeToAddOptions, colNames, firstColumnData);
    }, {once : true});
    
    //makeOption(tableID,placeToAddOptions,colNames,firstColumnData);

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


//END

/**
 *Make Clear All FIlters Button
 *
 * */
function makeClearAllButton(tableID, tableToolBar) {
    const newBtn = document.createElement('button');    
    newBtn.classList.add('btn', 'btn-outline-secondary', 'clearAllFilters');
    newBtn.innerHTML = `<i class="bi bi-x top-0"></i>Clear Filters`;
    newBtn.addEventListener('click', () => {
        var $table = $(`#${tableID}`)
        $table.bootstrapTable('filterBy', []);
    });
   // console.log(tableToolBar);
    tableToolBar.appendChild(newBtn);
}



/*
* Save The Filters
 */
function saveTheFilters(tableID,placeToAddOptions,savedFiltersForTableID){
    const saveFilterBtn = document.querySelector(`[data-save-filter-as='${tableID}']`);    
    const modalName = document.querySelector(`#filterTableFor-${tableID}`);
    saveFilterBtn.addEventListener('click',()=>{
        let filterName = document.querySelector(`[data-save-filter-name='${tableID}']`).value;
        if (!filterName) {
            toastr.warning('Filter name cannot be empty!');
            return false;
        }
        
        //console.log(filterName);
        let result = filterTable(tableID,placeToAddOptions);
        const list = document.querySelector(`[aria-labelledby="savedFilterForTable-${tableID}"]`);

        btnSaveFilterFunction(result);

        // console.log('IMP' : result);

        const resultNamePair = {
            filterName,
            result
        }
        //console.log(typeof result);
        /************************************************************************** */
        //change the name of local storage here
        //savedFiltersForTableID.push(resultNamePair);
        //   localStorage.setItem(`savedFiltersForTableID`, JSON.stringify(savedFiltersForTableID));
        list.innerHTML=``;
        populateFilters(tableID);
        $(modalName).modal('hide')


    });

}

function populateFilters(tableID){

    $(".loader-area, .loader").css("display", "block");

    $.ajax({
        url: "/SubjectMaster/GETFiltersForBootstrapTable",
        type: "POST",
        success: function (data) {
            //alert('PleaseCheckTestData');
            //var obj = JSON.stringify(data["data"]);
            //var data1 = JSON.parse(obj)
            if (data['data']) {


                var newdata = JSON.parse(data['data']);
                newdata = newdata.map(obj => {
                    Object.values(obj['result']).forEach(arr => {
                        var i = 0;
                        //console.log('arr', arr);
                        arr.forEach(val => {
                            //console.log('val',val,typeof val)
                            if (typeof val === 'string') {
                                //  console.log(val.replace(/\&amp;+/gi, '&'));
                                arr[i] = val.replace(/\&amp;+/gi, '&');
                                i++;
                            }
                        })
                    });
                    return obj;
                });
                const list = document.querySelector(`[aria-labelledby="savedFilterForTable-${tableID}"]`);
                list.innerHTML = ``;
                newdata.map(obj => {
                    var savedFilter = document.createElement('li');
                    savedFilter.innerHTML = `
                        <a class="dropdown-item " data-saved-filter='${obj.FilterName}' title="Delete" href="#">${obj.FilterName}<i data-filter-id="${obj.FilterId}" id="DeleteID" class="material-icons-outlined deleteFilter">delete</i></a>
                    `;
                    const clickElement = savedFilter.querySelector(`[data-saved-filter='${obj.FilterName}']`);
                    clickElement.addEventListener('click', () => {
                        $(function () {
                            var $table = $(`#${tableID}`);
                            var resultArr = [];
                            resultArr.push(obj.result);
                            $table.bootstrapTable('filterBy', resultArr[0]);
                        });
                    });
                    const deleteElement = savedFilter.querySelector('.deleteFilter');
                    let FilterId = deleteElement.getAttribute('data-filter-id');
                    deleteElement.addEventListener('click', () => {
                        btnDeleteFilterById(FilterId);
                        savedFilter.remove();

                    });
                    list.appendChild(savedFilter);
                });
            }

            $(".loader-area, .loader").fadeOut('slow');

        },
        error: function (errResponse) {         
            $(".loader-area, .loader").fadeOut('slow');
        }
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
        <div class="modal-dialog modal-lg  ">
            <div class="modal-content">
                <div class="modal-header">
                   <h5 class="modal-title" id="filterTableModal">Filter Table</h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true" style='font-size:25px;'>&times;</span>
                    </button>
                     
                </div>
                <!-- add the class name with the table id here -->
                <div class="modal-body" data-options-for-filter-table='${tableID}' id="tblSubjectNew">
                
                    <i class="fa fa-plus fa-pull-right blue-icon"></i>
                    <br>
                </div>

                <div class='saveFilter'>
                    <span>Save Filter As</span>
                    <input type="text" data-save-filter-name='${tableID}' class='form-control w-50' placeholder="Enter Filter Name" id='filterName'>
                </div>
                <div class="modal-footer">
                    <button type="button" data-save-filter-as='${tableID}' class="btn btn-outline-success" id="btnSaveFilter" >+ Save Filter</button>
                    <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
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

//function btnSaveFilterFunction(result, tableID)
//{
//    debugger;
//    var FilterName = document.getElementById('filterName').value;


//    var list=[{
//        result:JSON.stringify(result)
//    }];

//    result=JSON.stringify({'result':list});

//   // alert(JSON.stringify(list.result));
//    $.ajax({
//        //url: "/SubjectMaster/SaveFiltersForBootstrapTable?SubjectId="+result.SubjectId+"&SubjectCode="+result.SubjectCode+"&FilterName="+FilterName,
//       // url: "/SubjectMaster/SaveFiltersForBootstrapTable?ResultArray="+JSON.stringify(result)+"&FilterName="+FilterName+"&TableID="+tableID,
//        url: "/SubjectMaster/SaveFiltersForBootstrapTable?FilterName="+FilterName+"&TableID="+tableID,
//        type: "POST",
//        dataType:'JSON',
//        data:JSON.stringify(result),
//        contentType: "application/json;charset=utf-8",
//        success: function (data) {
//            //ClearData();
//            //CallBack(data);
//            //SubjectMasterTable();
//             location.reload();
//            //setTimeout(function () {
//            //    //alert('Reloading Page');
//            //    location.reload(true);
//            //}, 3000);
//       //    window.location = "/SubjectMaster/SubjectMaster";
//            $(".loader-area, .loader").fadeOut('slow');
//        },
//        error: function (errResponse) {
//            console.log(errResponse);
//            $(".loader-area, .loader").fadeOut('slow');
//        }
//    });
//}


//function btnSaveFilterFunction(result,TableId)
//{
//    debugger;
//    var FilterName = document.getElementById('filterName').value;
//    // var str =window.location.pathname;
        
//    //  var PageName =str.split('/').pop().split('/')[0];
   
//    var ResultArrs = [
//           {ResultArray: JSON.stringify(result) }    
//    ];      

//    var ResultArrs ={
//        ResultArray: JSON.stringify(result)  
//    }
          
    

//   // ResultArr = JSON.stringify({ 'ResultArr': ResultArrs });

//    $.ajax({
//         contentType: 'application/json; charset=utf-8',
//        dataType: 'json',
//        type: 'POST',
//        url: '/SubjectMaster/SaveFiltersForBootstrapTable?FilterName='+FilterName+"&TableId="+TableId,
//        data: JSON.stringify(ResultArrs),
//        success: function () {          
//            $('#result').html('"PassThings()" successfully called.');
//        },
//        failure: function (response) {          
//            $('#result').html(response);
//        }
//    }); 
   
//}
function btnSaveFilterFunction(result,TableId)
{
    var FilterName = document.getElementById('filterName').value;
    var str =window.location.pathname;
        
    var PageName =str.split('/').pop().split('/')[0];
   
    var ResultArrs = [
           {ResultArray: JSON.stringify(result) }    
    ];      


    ResultArr = JSON.stringify({ 'ResultArr': ResultArrs });

    $.ajax({
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'POST',
        url: '/SubjectMaster/SaveFiltersForBootstrapTable?FilterName='+FilterName+"&TableId="+TableId+"&PageName="+PageName,
        data: ResultArr,
        success: function () {          
            $('#result').html('"PassThings()" successfully called.');
        },
        failure: function (response) {          
            $('#result').html(response);
        }
    }); 
   

    
    
}

function btnDeleteFilterById(FilterId)
{
    debugger;
    //  var FilterName = document.getElementById('filterName').value;
    $.ajax({
        //url: "/SubjectMaster/SaveFiltersForBootstrapTable?SubjectId="+result.SubjectId+"&SubjectCode="+result.SubjectCode+"&FilterName="+FilterName,
        url: "/SubjectMaster/DeleteFilterByIdForBootstrapTable?FilterId="+FilterId,
        type: "POST",
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            //ClearData();
            //CallBack(data);
            //SubjectMasterTable();
            window.location = "/SubjectMaster/SubjectMaster";
            $(".loader-area, .loader").fadeOut('slow');
        },
        error: function (errResponse) {
          //  console.log(errResponse);
            $(".loader-area, .loader").fadeOut('slow');
        }
    });
}


/**
 * Make the Saved filters for the table
 * */ 
function makeSavedFilters(tableID,tableToolBar){
    
    const element = document.createElement('div');
    element.classList.add('dropdown','saved-filters');
    element.id = `${tableID}-saved-filters`;
    element.innerHTML = `
        <button class="btn btn-outline-primary dropdown-toggle savedFilters" type="button" id="savedFilterForTable-${tableID}" data-bs-toggle="dropdown" aria-expanded="false">
         <i class ="bi bi-arrow-return-left "></i>
            Previous Filters
     
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
function getFirstColumnValues(table, showColumnNames) {
    
    const firstColName = showColumnNames[0];    
    const values = allData
        .map(obj => {
            var index = Object.keys(allData[0]).indexOf(firstColName);            
            return obj[`${Object.keys(allData[3])[index]}`]
        })
        .filter((value, index, self) => self.indexOf(value) === index);
    return values.map(value => `<option value='${value}'>${value}</option>`).join('');
}

function getColumnNames(table, actualColNames, showColumnNames){
    const nameArray = Object.keys(allData[0]);    
    const optionNameArray = nameArray.map((name, i) => {        
        return `<option value='${name}'>${actualColNames[i]}</option>`
    }).filter(option => {
        var regex = new RegExp(/\'[a-zA-Z0-9]*\'|\"[a-zA-Z0-9]*\"/gi);        
        return showColumnNames.includes(option.match(regex)[0].slice(1, -1));
    });
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
        <select  class ="colName select-field" >
            <!--<option value="default">Select One</option>-->
            ${colNames}
</select></label>


<label for='operator'>Operator
<select id="ddlSubjectCategory" class ='operator select-field'>
    <option class="string defaultString" value="string">Equal to</option>
    <option class="numeric hide defaultNumeric" value='range'>Range</option>
    <option class="numeric hide" value="<"><</option>
    <option class="numeric hide" value="<="><=</option>
    <option class="numeric hide" value=">">></option>
    <option class="numeric hide" value=">=">>=</option>
    <option class="numeric hide" value="==">==</option>
  <!-- <option value="!=">Not equal to</option> -->
</select></label>


<label class='select-column-vals' for='columnValues'>Value
    <select class='optionsForColumn'>
        ${firstColumnData}
    </select>
</label>


<div class="input-container hide">
    <label for='valueToSearchFrom'>Value to Search
        <input type="number"  class ="valueToSearchFrom form-control"  />
    </label>
    <label for='valueToSearchTo'>
        <input type='number' name='' class='valueToSearchTo form-control' placeholder='To'/>
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
    const allNumericOperators = optionsSelect.querySelectorAll('.numeric');
    const allStringOperators = optionsSelect.querySelectorAll('.string');
    const defaultNumeric = optionsSelect.querySelector('.defaultNumeric');
    const defaultString = optionsSelect.querySelector('.defaultString');
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
    columnNameSelect.addEventListener('change', () => {        
        var selectionName = columnNameSelect.value;
        var flagToToggleSelect = typeof allData[0][selectionName];
        if (flagToToggleSelect === 'string') {
            rightSideValues = toggleRightSideValues(columnNameSelect);
            optionsForSelect.innerHTML = `${rightSideValues}`;
            $(optionsForSelect).select2("destroy").select2(select2Options);            
            allNumericOperators.forEach(opt1 => opt1.classList.add('hide'));
            allStringOperators.forEach(str1 => str1.classList.remove('hide'));
            allColumnDropdowns.classList.remove('hide');
            inputContainer.classList.add('hide');
            defaultString.selected = true;
        }
        else if (flagToToggleSelect === 'number') {
            allStringOperators.forEach(str1 => str1.classList.add('hide'));
            allNumericOperators.forEach(opt1 => opt1.classList.remove('hide'));
            allColumnDropdowns.classList.add('hide');
            inputContainer.classList.remove('hide');
            defaultNumeric.selected = true;
            showRangeTo(inputContainer);
           // console.log('make it so that it can now toggle the operator value')
        }
      //  console.log(flagToToggleSelect, typeof flagToToggleSelect);
       
    });

    //make the right side options multiselect
    $(optionsForSelect).select2(select2Options);


    // append the list to the container
    placeToAddOptions.appendChild(newOption);
}
//Make the options for the table END


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
        //console.log(slectedValue);
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
        if(operator==='string'){
            //choose the selects here and then the values .replace(/\&+/g,'%26')
            slectedValue.map(val => parameterList.push(val));
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
        else if (operator === '==') {                  
            parameterList.push(Number(parameter));
        }
        return {colName,parameterList};
    })
    // form an object to feed to the filter function
    var result = {};
    for (var i = 0; i < list.length; i++) {
        result[list[i].colName] = list[i].parameterList;
    }
   // console.log('result', result, JSON.stringify(result));
  
    //btnSaveFilterFunction(result);
    //feed the result to the filter by function of bootstrap table
    $(function() {
        var $table = $(`#${tableID}`)
        $table.bootstrapTable('filterBy', result);          
    })
    
    return result;

}
//Filter table END

/**
 * Toggle Right Dropdown values  Start
 */
function toggleRightSideValues(columnNameSelect){
    const columnName = columnNameSelect.value;
    const values = allData
                    .map(obj => obj[`${columnName}`])
        .filter((value, index, self) => self.indexOf(value) === index);
    // console.log(values)
    return values.map(value => `<option value="${value}">${value}</option>`).join('');
}
//Toggle Right Dropdown values END

/**
 * Options Toggle Start
 */
function toggleOptions(optionsSelect,allColumnDropdowns,inputContainer){
    if(optionsSelect.value ==='string'){        
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




/**
 * Options Toggle Start
 */
function toggleOptions(optionsSelect,allColumnDropdowns,inputContainer){
    if(optionsSelect.value ==='string'){        
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


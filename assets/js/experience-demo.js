document.addEventListener("DOMContentLoaded", async function () {
    var allModules;
    var allUsersDemoData;
    var api_url = "http://127.0.0.1:5605/"
    var api_key = "8779bad8-4022-11ee-be56-0242ac120002";
    var token;
    var user;
    //
    function getCookie(name) {
      let myvar = document.cookie;
      var result;
      myvar.split(";").forEach((cookie) => {
        var splitCookie = cookie.trim().split("=");
        if (splitCookie[0] == name) {
          result = splitCookie[1];
        }
      });
      return result;
    }
  
    // delete cookie function
    function deleteCookie(name) {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    }
  
    async function verifyToken(name) {
      token = getCookie(name);
      if (token) {
        var response = await fetch(api_url + "verifyToken", {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-auth-token": api_key,
            "x-access-token": token,
          },
        });
        if (response.status == 200) {
          console.log("token verified");
        } else if (response.status == 403) {
          console.log("403");
          deleteCookie("msToken");
          window.location.href = "./SignIn.html";
        }
  
        var data = await response.json();
        user = data;
      } else {
        window.location.href = "./SignIn.html";
      }
    }
  
    //create module list
    function createModuleList() {
      allModules.forEach((module) => {
        // create li element for the list in the submodule section.
        var option = document.createElement("option");
        option.setAttribute("value", module._id);
        option.setAttribute("id", `moduleListDropdownOption${module._id}`);
        option.innerHTML = module.title;
        document.getElementById("moduleListDropdown").appendChild(option);
      });
    }
  
    // create feedback table after selection of module

    // document.getElementById(`moduleListDropdown`).addEventListener("change", (e) => {
    //     // destroy the table
    //     document.getElementById("demoTable").innerHTML = `
          
    //   `;
    //     if (document.getElementById(`moduleListDropdown`).value == 0) {
    //       createDemoTable();
    //       return;
    //     }
    //     //populate subMdoule table
    //     var filtered = allUsersDemoData.filter(
    //       (userData) =>
    //         userData.demo.forEach(ademo => {
    //             ademo.moduelId == document.getElementById(`moduleListDropdown`).value
    //         })
            
    //     );
    //     var index = allModules.findIndex(
    //       (module) =>
    //         module._id == document.getElementById(`moduleListDropdown`).value
    //     );
    //     //
    //     if (filtered.length < 1) {
    //       document.getElementById(`feedbackTable`).innerHTML = `
    //       <td class="text-center" colspan="4">
    //       No Feedback Found
    //       </td>
    //           `;
    //     }
    //     filtered.forEach(async (item) => {
    //       var userIndex = await allUsers.findIndex(
    //         (user) => user._id == item.userId
    //       );
    //       if (userIndex > 0) {
    //         document.getElementById("feedbackTable").innerHTML = `
          
    //           `;
    //         createFeedbackCard(
    //           item,
    //           allModules[index].title,
    //           allUsers[userIndex].fullName
    //         );
    //       } else {
    //         document.getElementById(`feedbackTable`).innerHTML = `
    //           <tr>
    //               <td class="text-center" colspan="4">No Feedback Found</td>
    //           </tr>
    //           `;
    //       }
    //     });
    //   });

    //create demo card
    var arr1 =[]
    function createDemoCard(user, moduleName, demo) {
        var dataArray ;
        var dateVar = ((new Date(demo.demoTime)).toString()).split(' ');
        try {
          
          var dateVarTime = dateVar[4].split(':')
          dateVarTime[3] = 'AM'
          if (parseInt(dateVarTime[0]) >= 12) {
            dateVarTime[0] = (parseInt(dateVarTime[0]) - 12).toString()
            dateVarTime[3] = 'PM'
            dateVarTime[0] = '0' + dateVarTime[0]

          }
          dateVar[4] = dateVarTime[0] + ':' + dateVarTime[1] + ':' + dateVarTime[2] + ' ' + dateVarTime[3]
        } catch (e) {
          console.error(e)
        }

        var formatedDate = dateVar[2] + ' ' + dateVar[1] + ' ' + dateVar[3] + ' ' + dateVar[4]

        dataArray = {
          "fullName": user.fullName,
          "emailId":user.emailId,
          "phoneNumber":demo.phoneNumber,
          "moduleName":moduleName,
          "formatedDate": formatedDate,
          "remarks": demo.remarks,
      }
      arr1.push(dataArray)
    }
    //create scheduled demo table
    function createDemoTable() {
        document.getElementById("demoTable").innerHTML = ""
        allUsersDemoData.forEach(user => {
            user.demo.forEach(async (aDemo) => {
                var index = await allModules.findIndex((obj) => obj._id == aDemo.moduleId)
                if(index >= 0) {
                    createDemoCard(user, allModules[index].title, aDemo )
                }
                var oTable = $('#tblModuleDemmos').bootstrapTable('destroy').bootstrapTable(bootstrapTableSettings(arr1));
              function bootstrapTableSettings(data, pagination=true) {
                  const tableSettings = {
                      destroy: true,
                      search: true,
                      pagination: pagination,
                      sortable: true,
                      showColumns: true,                  //Whether to display all columns (select the columns to display)
                   //   showRefresh: true,
                      showToggle: true,
                      exportDataType: "all",
                      minimumCountColumns: 2,
                      filterControl: true,
                      showExport: true,
                      showColumnsToggleAll: true,
                      filterControlVisible: false,
                      //filterControlContainer: true,
                      showFilterControlSwitch: false,
                      showFilterControlSwitch: true,
                      advancedSearch: true,
                      advancedSearch: true,
                      data: data,
                      exportTypes: ['doc', 'excel'],
                      pageList: "[10, 25, 50, 100, all]",
                  }
                  return tableSettings;
              }
            })
        })
    }
      //fetch all modules.

    async function fetchModules() {
    var response = await fetch(api_url + "module", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
        "x-access-token": token,
      },
    });
    var data = await response.json();
    allModules = data;

    var sortOrderStr = allModules[0].demonstratorEmail;
    sortOrder = sortOrderStr.map(function (str) {
      // using map() to convert array of strings to numbers

      return parseInt(str);
    });
    sortOrderId = allModules[0]._id;
    allModules.splice(0, 1);

    }

    //fetch All User Data
    async function fetchUsersDemoData() {
      var response = await fetch(api_url + "register/demoData", {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "x-access-token": token,
        },
      });
      var userData = await response.json();
      allUsersDemoData = userData;
    }
  
    try {
      token = await getCookie("msToken");
      await verifyToken("msToken");
      document.getElementById("username").innerHTML = user.fullName;
      if (user.userType != -1) {
        window.location.href = "./Modules.html";
      }
      try {
        await fetchModules();
        createModuleList();
      } catch (e) {
        //console.log(e);
      }
      try {
        await fetchUsersDemoData();
        createDemoTable();
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log(e);
    }
  
    //logout
    document.getElementById("logout").addEventListener("click", function () {
      Swal.fire({
        title: "LogOut",
        text: "Are you sure, you want to logout?",
        icon: "warning",
        confirmButtonText: "Confirm Logout",
        confirmButtonColor: "#ff0000",
        showCancelButton: true,
      }).then((result) => {
        // Read more about isConfirmed, isDenied below /
        if (result.isConfirmed) {
          deleteCookie("msToken");
          window.location.href = "./SignIn.html";
        }
      });
    });
  });
  
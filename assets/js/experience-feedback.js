document.addEventListener("DOMContentLoaded", async function () {
  var allModules;
  var allFeedbacks;
  var moduleFeedbacks = [];
  var imageFeedbacks = [];
  var mediaArray = [];
  var allUsers;
  //var api_url = "https://api.mastersofterp.in/MSEXP/";
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

  //create module feedback table no filtering
  function createFeedbackTable() {
    var arr1 = [];
    var table = document.getElementById("feedbackTable");
    table.innerHTML = "";

    moduleFeedbacks.forEach((feedback) => {
      var userIndex = allUsers.findIndex((user) => user._id == feedback.userId);
      var index = allModules.findIndex((module) => module._id == feedback.moduleId);
      
      if (userIndex > -1 && index > -1) {
        var obj = {
          "fullName" : allUsers[userIndex].fullName,
          "rating" : feedback.rating,
          "moduleName" :allModules[index].title,
          "remarks" : feedback.remarks,
          "client" : feedback.client
        }
        arr1.push(obj)
      }

    });
    var oTable = $('#feedbackTableNew').bootstrapTable('destroy').bootstrapTable(bootstrapTableSettings(arr1));
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
  }

    //create image feedback table no filtering
  function createImageFeedbackTable() {

      var arr1 = [];    
      var table = document.getElementById("imageFeedbackTable");
      table.innerHTML = "";
      console.log(imageFeedbacks);

      imageFeedbacks.forEach((feedback) => {
        var userIndex = allUsers.findIndex((user) => user._id == feedback.userId);
        var index = allModules.findIndex((module) => module._id == feedback.moduleId);
        var media
        
        if (userIndex > -1 && index > -1) {
            allModules[index].subModule.forEach((subModule) => {

            var mediaIndex = subModule.media.findIndex(media => media._id == feedback.mediaId)
            media = subModule.media[mediaIndex]
            if(media) {
              var  obj = {
                "fullName" : allUsers[userIndex].fullName,
                "view" : media.link,
                "moduleName" : allModules[index].title,
                "remarks" : feedback.remarks,
                "client" : feedback.client
              }
              arr1.push(obj)
            }

          })
          
        }
      });

      var oTable = $('#imageFeedbackTableNew').bootstrapTable('destroy').bootstrapTable(bootstrapTableSettings(arr1));
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
    }

  // fetch feedbacks
  async function fetchFeedback() {
    var response = await fetch(api_url + "feedback", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-access-token": token,
      },
    });
    var feedbackData = await response.json();
    allFeedbacks = feedbackData;
    allFeedbacks.forEach(feedback => {
      if(feedback.mediaId != -1) {
        imageFeedbacks.push(feedback);      
      } else {
        moduleFeedbacks.push(feedback);
      }
    })
  }

  //fetch All User Data
  async function fetchUsers() {
    var response = await fetch(api_url + "register", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-access-token": token,
      },
    });
    var userData = await response.json();
    allUsers = userData;
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

    allModules.forEach((module) => {
      module.subModule.forEach(aSubModule => {
      if(aSubModule.media.link){
        console.log(aSubModule.media)
        mediaArray.concat(aSubModule.media)
      }
      })
    })
  }

  // try {
    token = await getCookie("msToken");
    await verifyToken("msToken");
    document.getElementById("username").innerHTML = user.fullName;
    if (user.userType != -1) {
      window.location.href = "./Modules.html";
    }
    try {
      await fetchModules();
      //createModuleList();
    } catch (e) {
      console.log(e);
    }
    try {
      await fetchFeedback();
    } catch (e) {
      console.log(e);
    }
    // try {
      await fetchUsers();
      createImageFeedbackTable();
      arr1 = []
      createFeedbackTable();
      
    // } catch (e) {
    //   console.log(e);
    // }
  // } catch (e) {
  //   console.log(e);
  // }

  //logout
  document.getElementById("logout").addEventListener("click", function () {
    Swal.fire({
      title: "LogOut",
      text: "Are you sure, you want to logout?",
      icon: "warning",
      confirmButtonText: "Confirm Logout",
      confirmButtonColor: "red",
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

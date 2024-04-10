document.addEventListener("DOMContentLoaded", async function () {
    var allModules;
    var allFeedbacks;
    var allUsers;
    //var api_url = "https://api.mastersofterp.in/MSEXP/";
    var api_url = "http://127.0.0.1:5605/"
    var api_key = "8779bad8-4022-11ee-be56-0242ac120002";
    var token
    var user
     //
    function getCookie(name) {
    let myvar = document.cookie
    var result;
    myvar.split(";").forEach(cookie => {

      var splitCookie = cookie.trim().split("=");
      if (splitCookie[0] == name) {
        result = splitCookie[1];
      }
    })
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
          })
          if (response.status == 200) {
            console.log('token verified')
          }
    
          else if (response.status == 403) {
            console.log('403')
            deleteCookie("msToken")
            window.location.href = "./SignIn.html";
          }
    
          var data = await response.json();
          user = data;
        }
        else {
          window.location.href = "./SignIn.html";
        }
      }
    
    // create user entry in table 
    function createUsercard(user) {
        var status;
        var statusAttr;
        var admin = false;
        var buttonActivity = "";
      if(user.userType == -1) {
        admin = true;
        buttonActivity = "active";
      }

    if (user.status == 'active') {
      status = "Active";
      statusAttr = "badge-success";
    } else {
      status = "Inactive";
      statusAttr = "badge-danger";
    }
        tr = document.createElement("tr");
        tr.innerHTML = `
		<td>${user.fullName}</td>
		<td>${user.orgName}</td>
		<td>${user.emailId}</td>
    <td><button id="newModuleStatus${user._id}" type="button" class="btn btn-toggle btn-primary ${buttonActivity}"
    data-bs-toggle="button" aria-pressed="${admin}" autocomplete="off">
    <div class="handle"></div>
  </button></td>
	    <td><span class="badge ${statusAttr}" id="user_status ${user._id}">${status}</span></td>
    `;  
        document.getElementById('allUserTable').appendChild(tr);

        // toggle status
        var toggleBadge = tr.querySelector(`[id="user_status ${user._id}"]`);
        toggleBadge.style.cursor = "pointer";
        toggleBadge.addEventListener("click", async function () {
          var T;
          if (toggleBadge.classList.contains("badge-success")) {
            toggleBadge.className = "badge badge-danger";
            toggleBadge.innerHTML = "Inactive";
            T = 'inActive'
            //console.log(status);
          } else if (toggleBadge.classList.contains("badge-danger")) {
            toggleBadge.className = "badge badge-success";
            toggleBadge.innerHTML = "Active";
            T = 'active'
            //console.log(status);
          }
          var index = allUsers.findIndex(item => item._id == user._id)
          allUsers[index].status = T;
          var response = await fetch(
            api_url + "register/" + user._id,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
                "x-access-token": token,
              },
              body: JSON.stringify({status: allUsers[index].status}),
            }
          );
          if (response.status == 200) {
            iziToast.success({ message: `User is ${toggleBadge.innerHTML}`, position: 'bottomLeft' });
          }
          else if (response.status == 400) {
            iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
          }
    
          var data = await response.json();
          //console.log(data);
        });

        // toggle admin
        var toggleAdmin = tr.querySelector(`[id="newModuleStatus${user._id}`);
        toggleAdmin.style.cursor = "pointer";
        toggleAdmin.addEventListener("click", async function(){
          var adminStatus = toggleAdmin.getAttribute("aria-pressed")
          var userType
          if (adminStatus == 'true') {
            userType = -1;
          }
          else if(adminStatus == 'false') {
            userType = 1;
          }
          var response = await fetch(
            api_url + "register/" + user._id,
            {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
                "x-access-token": token,
              },
              body: JSON.stringify({userType : userType}),
            }
          );
          var data = await response.json();
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

  try {
    token = await getCookie("msToken")
    await verifyToken("msToken")
    document.getElementById('username').innerHTML = user.fullName;
    if (user.userType != -1) {
      window.location.href = "./Modules.html";
    }

    await fetchUsers();

    allUsers.forEach(user => {
        createUsercard(user)
    })

  } catch (e) {
    console.log(e)
  }

    //logout
    document.getElementById("logout").addEventListener("click", function () {
        Swal.fire({
          title: 'LogOut',
          text: 'Are you sure, you want to logout?',
          icon: 'warning',
          confirmButtonText: 'Confirm Logout',
          confirmButtonColor: "#ff0000",
          showCancelButton: true
        }).then((result) => {
          // Read more about isConfirmed, isDenied below /
          if (result.isConfirmed) {
            deleteCookie("msToken");
            window.location.href = "./SignIn.html";
          }
        })
        
      })

});
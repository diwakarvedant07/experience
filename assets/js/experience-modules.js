const api_key = "8779bad8-4022-11ee-be56-0242ac120002";
var api_url = "http://127.0.0.1:5605/"
document.addEventListener("DOMContentLoaded",async function () {
  var token;
  let allModules;
  let allTiers;
  var sortOrder = [];
  var user;
  var productId = getCookie("productId")
  // set cookie function
  function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  }

  // get cookie function
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

  token = getCookie("msToken");

  // delete cookie function
  function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }

  //read more event listener function
  function readMore() {
    document.querySelectorAll(".btnReadMore").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.parentNode.querySelector("span").classList.toggle("read_more");
        if (btn.innerHTML == ". . Read more") {
          btn.parentElement.classList.remove("h-200")
          btn.innerHTML = "Read less";
        } else {
          btn.innerHTML = ". . Read more";
          btn.parentElement.classList.add("h-200")
        }
      });
    });
  }

  //verify the token inside cookie; if token verified send to Modules.html else continue with login
  async function verifyToken() {
    if (token) {
      var response = await fetch(api_url + "verifyToken", {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "x-auth-token": api_key,
          "x-access-token": token,
        },
      });
      // console.log(response)
      if (response.status == 200) {
      } else if (response.status == 403) {
        deleteCookie("msToken");
        window.location.href = "./SignIn.html";
      }
      var data = await response.json();
      user = data;
    } else {
      window.location.href = "./SignIn.html";
    }
  }

  // fetch Modules
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
    allModules.splice(0, 1);

    var sortedAllModules = allModules.sort(function (a, b) {
      return (
        sortOrder.indexOf(a.serialNumber) - sortOrder.indexOf(b.serialNumber)
      );
    });

    allModules = sortedAllModules.filter((module) => module.productId == productId);
  }

  // Fetch all Tiers.
  async function fetchTiers() {
    var response = await fetch(api_url + "Tier", {
    method: "GET",
    headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
        "x-access-token": token,
    },
    });
    var data = await response.json();
    allTiers = data;
}

  //create module card function
  function createModuleCard(module) {
    var div = document.createElement("div");
    div.setAttribute("class", "col-lg-4 col-md-6 col-12");
    if(module.description.length > 320) {
      div.innerHTML = `
      <div class="box bt-3 border-primary pull-up">
                <div class="box-body d-flex flex-column h-200">
      
                    <div class="divIcon bg-primary" id="openModuleDetails${module._id}">

                      <i class="${module.icon}"></i>
                    </div>

                    <a class="fs-16 fw-500 mb-1" href="javascript:void(0)" id="openModuleDetails${module._id}">${module.title}</a>
                    <span class="read_less fs-14 d-block" id="openModuleDetails${module._id}">${module.description}</span>
                    <a class="text-end btnReadMore" href="javascript:void(0)">. . Read more</a>
                </div>
              </div>
      `;
    }
    else {
      div.innerHTML = `
      <div class="box bt-3 border-primary pull-up">
                <div class="box-body d-flex flex-column h-200">
                  <div class="divIcon bg-primary" id="openModuleDetails${module._id}">
                    
                    <i class="${module.icon}"></i>
                  </div>
                  
                  <a class="fs-16 fw-500 mb-1" href="javascript:void(0)" id="openModuleDetails${module._id}">${module.title}</a>
                  <span class="read_less fs-14 d-block" id="openModuleDetails${module._id}">${module.description}</span>
                </div>
              </div>
      `;
    }
    document.getElementById("moduleCards").appendChild(div);
    // document.getElementById(`openModuleDetails ${module._id}`).addEventListener("click", () => {
    //     setCookie("moduleId", module._id, 1);
    //     window.location.href = "./ModulesDetails.html";
    //   });
    
      div.querySelectorAll(`#openModuleDetails${module._id}`).forEach(item => {
        item.addEventListener("click", () => {
          setCookie("moduleId", module._id, 1);
          window.location.href = "./ModulesDetails.html";
        });
      })
  }

  // create tier buttons 
  function createTierButtons(tier) {
    var tierBox =  document.getElementById("tierButtons")
    var tierButton = document.createElement("div")
    tierButton.innerHTML = `
    <button type="button" class="btn btn-primary demo-button btn-sm me-1" id="tierButton" value="${tier._id}"><i class="${tier.icon}"></i><span> ${tier.title}</span></button>
    `
    tierBox.appendChild(tierButton)
  }

  //open module page
  async function populateModules() {
    //get allModules
    await verifyToken();
    document.getElementById("username").innerHTML = user.fullName;
    if(user.userType < 0) {
      console.log("reached")
      document.getElementById("username").addEventListener("click" , function(){
        window.location.href = "./ModuleSetup.html"
      })
    }
    await fetchModules();
    await fetchTiers();

    // fill the drop down for tier
    allTiers.forEach((tier) => {
      if (tier.status == true) {

        createTierButtons(tier)
      }
    })

    //make cards
    allModules.forEach((module) => {
      if (module.status == true) {
        createModuleCard(module);
      }
    });
    //adding readmore
    readMore();
  }
  var loader = document.getElementById("loader")

  //loadNow(1,5000)
  await populateModules();
  //loader.style.display = "none";


  function loadNow(opacity,timeout) {
		if (opacity <= 0) {
			displayContent();
		} else {
			loader.style.opacity = opacity;
			window.setTimeout(function() {
				loadNow(opacity - 0.05);
			}, timeout);
		}
	}


  // event listeners for tier buttons
  document.querySelectorAll('[id = "tierButton"]').forEach( (button) => {
    button.addEventListener('click', () => {
      console.log(button.value)
      var tierId = button.value
      var index = allTiers.findIndex((tier) => tier._id == tierId)

      var filteredModules = []
      var currentTier = allTiers[index]
      console.log(currentTier)
      while (true && currentTier) {
        console.log(currentTier)
        filteredModules = filteredModules.concat(allModules.filter(module => module.tier == currentTier._id))
        if (currentTier.parent == "-1") {
          break;
        } 
        var newIndex = allTiers.findIndex((tier) => tier._id == currentTier.parent)
        currentTier = allTiers[newIndex]
      }
      console.log(filteredModules)
      document.getElementById("moduleCards").innerHTML = '';
      filteredModules.forEach( (module) => {
        createModuleCard(module)
      })
      if(tierId == 0) {
        allModules.forEach( (module) => {
          createModuleCard(module)
        })
      }
    })

  })

  //logout
  document.getElementById("logout").addEventListener("click", function () {
    Swal.fire({
      title: "LogOut",
      text: "Are you sure, you want to logout?",
      icon: "warning",
      confirmButtonText: "Confirm Logout",
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

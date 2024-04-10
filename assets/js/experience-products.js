const api_key = "8779bad8-4022-11ee-be56-0242ac120002";
//var api_url = "http://127.0.0.1:5605/"
var api_url = "https://api.mastersofterp.in/MSEXP/";
document.addEventListener("DOMContentLoaded",async function () {
  var token;
  let allproducts;
  var sortOrder = [];
  var user;
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

  //verify the token inside cookie inside token; if token verified send to products.js else continue with login. takes argument token name
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

  // fetch products
  async function fetchproducts() {
    var response = await fetch(api_url + "product", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
        "x-access-token": token,
      },
    });
    var data = await response.json();
    allproducts = data;

    var sortOrderStr = allproducts[0].demonstratorEmail;
    sortOrder = sortOrderStr.map(function (str) {
      // using map() to convert array of strings to numbers

      return parseInt(str);
    });
    allproducts.splice(0, 1);

    var sortedAllproducts = allproducts.sort(function (a, b) {
      return (
        sortOrder.indexOf(a.serialNumber) - sortOrder.indexOf(b.serialNumber)
      );
    });
    allproducts = sortedAllproducts;
  }

  //create product card function
  function createproductCard(product) {
    var div = document.createElement("div");
    div.setAttribute("class", "col-lg-4 col-md-6 col-12");
    if(product.description.length > 320) {
      div.innerHTML = `
      <div class="box bt-3 border-primary pull-up">
                <div class="box-body d-flex flex-column h-200">
      
                    <div class="divIcon bg-primary" id="openproductDetails${product._id}">

                      <i class="${product.icon}"></i>
                    </div>

                    <a class="fs-16 fw-500 mb-1" href="javascript:void(0)" id="openproductDetails${product._id}">${product.title}</a>
                    <span class="read_less fs-14 d-block" id="openproductDetails${product._id}">${product.description}</span>
                    <a class="text-end btnReadMore" href="javascript:void(0)">. . Read more</a>
                </div>
              </div>
      `;
    }
    else {
      div.innerHTML = `
      <div class="box bt-3 border-primary pull-up">
                <div class="box-body d-flex flex-column h-200">
                  <div class="divIcon bg-primary" id="openproductDetails${product._id}">
                    
                    <i class="${product.icon}"></i>
                  </div>
                  
                  <a class="fs-16 fw-500 mb-1" href="javascript:void(0)" id="openproductDetails${product._id}">${product.title}</a>
                  <span class="read_less fs-14 d-block" id="openproductDetails${product._id}">${product.description}</span>
                </div>
              </div>
      `;
    }
    document.getElementById("productCards").appendChild(div);
    // document.getElementById(`openproductDetails ${product._id}`).addEventListener("click", () => {
    //     setCookie("productId", product._id, 1);
    //     window.location.href = "./productsDetails.html";
    //   });
    
      div.querySelectorAll(`#openproductDetails${product._id}`).forEach(item => {
        item.addEventListener("click", () => {
          setCookie("productId", product._id, 1);
          window.location.href = "./Modules.html";
        });
      })
  }

  //open product page
  async function populateproducts() {
    //get allproducts
    await verifyToken();
    document.getElementById("username").innerHTML = user.fullName;
    if(user.userType < 0) {
      console.log("reached")
      document.getElementById("username").addEventListener("click" , function(){
        window.location.href = "./ModuleSetup.html"
      })
    }
    await fetchproducts();
    //make cards
    allproducts.forEach((product) => {
      if (product.status == true) {
        createproductCard(product);
      }
    });
    //adding readmore
    readMore();
  }
  var loader = document.getElementById("loader")

  //loadNow(1,5000)
  await populateproducts();
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

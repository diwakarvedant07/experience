const api_key = "8779bad8-4022-11ee-be56-0242ac120002";

 var api_url = "http://127.0.0.1:5605/"
//var api_url = "https://api.mastersofterp.in/MSEXP/";

document.addEventListener("DOMContentLoaded", function () {
  let token;
  let moduleId;
  let moduleData;
  let allTiers;
  let rating;
  let user;
  let sendFeedbackForImage;
  let tierIdForFiltering;

  function FeedbackForm(moduleId, rating, remarks, mediaId, client) {
    this.moduleId = moduleId;
    this.rating = rating;
    this.remarks = remarks;
    this.mediaId = mediaId;
    this.client = client;
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

  // delete cookie function
  function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }

  token = getCookie("msToken");
  moduleId = getCookie("moduleId");

  async function verifyToken(token) {
    token = getCookie(token);
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
  // fetch module data
  async function getModuleData(moduleId) {
    var response = await fetch(api_url + "module/" + `${moduleId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
        "x-access-token": token,
      },
    });
    var data = await response.json();
    moduleData = data;
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
  var cnt1 = 1;
  // add to submodule list function
  function addToSubmoduleList(subModule) {
    cnt1 = cnt1 + 1;
    var a = document.createElement("a");
    a.className = "mb-3 list-group-item list-group-item-action";
    a.href = `#submodule${cnt1}`;
    a.innerHTML = `
        <i class="bi bi-chevron-double-right me-2"></i>${subModule.title}
        `;

    document.getElementById("subModuleListInMenu").appendChild(a);

    var a = document.createElement("a");
    a.className = "mb-3 list-group-item list-group-item-action";
    a.href = `#submodule${cnt1}`;
    a.innerHTML = `
        <i class="bi bi-chevron-double-right me-2"></i>${subModule.title}
        `;

    document.querySelector("#subModuleList").appendChild(a);
  }

  // add submodule card
  var cnt = 1;
  function addSubModuleCard(subModule) {
    // console.log(subModule)
    cnt = cnt + 1;
    var card = document.createElement("div");
    card.setAttribute("class", "blog-post mb-40");
    card.setAttribute("id", `submodule${cnt}`);
    var filiteredMedia = filterMedia(subModule.media)
    //console.log(filiteredMedia, subModule.mediaType);
    //adding prev and next buttons if the media length is more than one
    var display = "";
    if (filiteredMedia.length > 1) {
        display = "block !important"
    }
    else {
      display = "none !important"
    }
    if (subModule.mediaType == 1 && filiteredMedia.length >= 1) {
      //console.log("gefre")
          card.innerHTML = `

						<div class="blog-detail" >

              <div class="d-flex justify-content-between mb-20" id="btnsfeedbackDemo">
              <div class="entry-title fs-24" >
              <span>${subModule.title}</span>
            </div>
					    </div>
              <div id="carouselExampleIndicators${subModule._id}" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-indicators hide" id='carouselIndicator${subModule._id}'></div>
                <div class="carousel-inner"   id='photo-holder${subModule._id}' ></div>
                <button style="display:${display};" class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators${subModule._id}" data-bs-slide="prev">
                  <div>
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                  </div>
                </button>
                <button style="display:${display};" class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators${subModule._id}" data-bs-slide="next">
                  <div>
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                  </div>
                </button>
              </div>
							<div class="entry-content"	>
              <p>${subModule.description}</p>
							</div>
              </div>
              `;


    }
    else if (subModule.mediaType == 2) {
      card.innerHTML = `

      <div class="blog-detail" >
        <div class="entry-title fs-24" >
          <span>${subModule.title}</span>
        </div>
       
        <video id="player1" class='w-p100' src="${subModule.media[0].link}" controls preload="none"></video>

        <div class="entry-content"	>
        <p>${subModule.description}</p>
        </div>
        </div>
        `;
    }
    else if (subModule.mediaType == 3) {
      card.innerHTML = `

      <div class="blog-detail" >
          <div class="entry-title fs-24" >
            <span>${subModule.title}</span>
          </div>
          <div class='w-p100 h-300'>
            <iframe src="${subModule.media[0].link}"  class='w-p100 h-p100' frameborder="0"></iframe>
          </div>
          <div class="entry-content"	>
            <p>${subModule.description}</p>
          </div>
      </div>
        `;
    }
    else {
      card.innerHTML = `

      <div class="blog-detail" >
        <div class="entry-title fs-24" >
          <span>${subModule.title}</span>
        </div>
        <div class="row justify-content-center">
        <div class="col-lg-6 col-12">
        <div id="carouselExampleIndicators${subModule._id}" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators" id='carouselIndicator${subModule._id}'>
         
        </div>
        </div>

      </div>
      </div>
      </div>
        <div class="entry-content"	>
        <p>${subModule.description}</p>
        </div>
        </div>
        `;
    }


    document.getElementById("subModuleCards").appendChild(card);
    var i = 0;
    try {
      filiteredMedia.forEach((obj) => {
      //console.log(obj);
      var div = document.createElement("div");
      div.classList.add("carousel-item");
      div.style.height = "100%";
      div.style.width = "100%";
      div.innerHTML = `
      <button id="imageFeedback-${obj._id}" style="position: relative; left:89%; top:5px; z-index:2;" data-bs-toggle="modal" data-bs-target="#imageFeedbackModal">Feedback</button>
        <div class="d-flex justify-content-center align-items-center" style="min-height:250px;max-height:350px;background:#000;">
          <img src="${obj.link}" class="d-block carousel-image-selector" alt="Server Image" style="object-fit: contain;" id="${obj._id}"  data-bs-toggle="modal" data-bs-target="#imageModal">
          <div class="carousel-caption d-block pb-0">
          <div class="rounded-1" style="background:rgba(0, 0, 0, 0.45); position: relative;">
            <p class='text-white mb-0'><b>${obj.caption}</b></p>
            
        </div>
          </div>
        </div>
      `;
      
      const image = div.querySelector('.carousel-image-selector');
      // console.log(image)
      image.addEventListener('click', function () {
        const modalImage = document.getElementById('modalImage');
        const imageModalLabel = document.getElementById('imageModalLabel');
        imageModalLabel.textContent = obj.caption;
        modalImage.src = image.src;
      });

      const feedbackButton = div.querySelector(`#imageFeedback-${obj._id}`);

      feedbackButton.addEventListener('click', function () {
        sendFeedbackForImage = obj._id;
        console.log(sendFeedbackForImage);
      })

      document.getElementById(`photo-holder${subModule._id}`).appendChild(div);

      var button = document.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute(
        "data-bs-target",
        `#carouselExampleIndicators${subModule._id}`
      );
      button.setAttribute("data-bs-slide-to", `${i}`);
      button.setAttribute("aria-label", `Slide ${i}`);
      document.getElementById(`carouselIndicator${subModule._id}`).appendChild(button);
      i++;
    });
    if (subModule.media.length > 0) {
      document.getElementById(`photo-holder${subModule._id}`).childNodes[0].classList.add("active");
      document.getElementById(`carouselIndicator${subModule._id}`).childNodes[0].classList.add("active");
      document.getElementById(`carouselIndicator${subModule._id}`).childNodes[0].setAttribute("aria-current", "true");

    }
    
    } catch (e) {}

    try {
      //event listener for image feedback
      document.getElementById(`imageFeedbackButton-${subModule._id}`).addEventListener('click', function(){
      var tierIdString = card.querySelector('[class="carousel-item active"]').firstElementChild.getAttribute("id")
      sendFeedbackForImage = tierIdString.split('-')[1]
      //console.log(sendFeedbackForImage)
    })
    } catch (e) {}

    // subModule.media.forEach((link) => {
    //   console.log(link);
    //   var div = document.createElement("div");
    //   div.className = "col-lg-4 col-md-6 col-12 mb-2";
    //   div.innerHTML = `
    //   <a href="${link}" data-fancybox="gallery${subModule._id}">
    //   <img class="img-responsive thumbnail" src="${link}" alt="">
    //   </a>
    //   `;
    //   Fancybox.bind(`[data-fancybox="gallery${subModule._id}"]`, {
    //     // Your custom options
    //   });
    //   document.getElementById(`mediaContent${subModule._id}`).appendChild(div);
    // });
  }

  // Create tier buttons
  function createTierButtons(tier) {
    //console.log(tier)
    var tierBox =  document.getElementById("tierButtons")
    var tierButton = document.createElement("div")
    tierButton.innerHTML = `
    <button type="button" class="btn btn-primary demo-button btn-sm me-1" id="tierButton" value="${tier._id}"><i class="${tier.icon}"></i><span> ${tier.title}</span></button>
    `
    tierBox.appendChild(tierButton)
  }
 


  //feedback stars
  function starRatingInit() {
    $(".my-rating-4").starRating({
      totalStars: 5,
      starShape: "rounded",
      starSize: 40,
      emptyColor: "lightgray",
      hoverColor: "gold",
      activeColor: "gold",
      ratedColor: "gold",
      useGradient: false,
      // disableAfterRate: false
      callback: function (currentRating) {
        rating = currentRating;
        document.getElementById("star-rating").innerHTML = "";
        div = document.createElement("div");
        div.setAttribute("class", "my-rating-4");
        div.setAttribute("data-rating", rating);
        document.getElementById("star-rating").appendChild(div);
        starRatingInit();
      },
    });
  }
  starRatingInit();
  // event listener for submitting form
  document.getElementById("submitFeedback").addEventListener("click", function () {
      sendFeedback();
    });
    
  // event listener for submitting IMAGE FEEDBACK form
  document.getElementById("submitImageFeedback").addEventListener("click", function () {
    sendImageFeedback();
  });

  //event listener for tier ddl
  // document.getElementById("tierListDropdown").addEventListener("change", function() {
  //   var tierId = document.getElementById("tierListDropdown").value
  //   var index = allTiers.findIndex((tier) => tier._id == tierId)

  //   var filteredModules = []
  //   var currentTier = allTiers[index]
  //   console.log(currentTier)
  //   while (true) {
  //     console.log(currentTier)
  //     filteredModules = filteredModules.concat(moduleData.subModule.filter(module => module.tier == currentTier._id))
  //     if (currentTier.parent == "-1") {
  //       break;
  //     } 
  //     var newIndex = allTiers.findIndex((tier) => tier._id == currentTier.parent)
  //     currentTier = allTiers[newIndex]
  //   }
  //   console.log(filteredModules)
  //   document.getElementById("subModuleCards").innerHTML = '';
  //   document.getElementById("subModuleList").innerHTML = '';
  //   filteredModules.forEach( (module) => {
  //     addToSubmoduleList(module)
  //     addSubModuleCard(module)
  //   })
  //   if(tierId == 0) {
  //     allModules.forEach( (module) => {
  //       addToSubmoduleList(module)
  //       addSubModuleCard(module)
  //     })
  //   }
  // })




  // check if user has already submitted feedback for this module

  async function checkFeedback() {
  try {

      var response = await fetch(
      api_url + "feedback/" + `${user._id}/${moduleId}`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "x-access-token": token,
        },
      }
    );
    if (response.status == 200) {
      //already submitted feedback for this module
      $(".btnFeedback").each(function () {
        $(this).hide();
      });
    } else if (response.status == 404) {
      //make feedback button visible
      $(".btnFeedback").each(function () {
        $(this).show();
      });
    }

  } catch (e) {
  }
  }

  // take feedback and send it to backend.
  async function sendFeedback() {
    //document.getElementById("FeedbackModal").modal("hide")
    var feedback = new FeedbackForm();
    feedback.moduleId = moduleData._id;
    feedback.rating = rating;
    feedback.remarks = document.getElementById("feedbackRemarks").value;
    feedback.client = document.getElementById("feedbackClient").value;
    //console.log(feedback);
    var response = await fetch(api_url + "feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify(feedback),
    });
    if (response.status == 201) {
      $(".btnFeedback").each(function () {
        $(this).hide();
      });
      iziToast.success({
        message: "Feedback Submitted Successfully",
        position: "bottomCenter",
      });

      rating = 0;
    }
  }

  // take feedback and send it to backend.
  async function sendImageFeedback() {
    //document.getElementById("FeedbackModal").modal("hide")
    var feedback = new FeedbackForm();
    feedback.moduleId = moduleData._id;
    feedback.mediaId = sendFeedbackForImage
    feedback.remarks = document.getElementById("imageFeedbackRemarks").value;
    feedback.client = document.getElementById("imageFeedbackClient").value
    //console.log(feedback)
    var response = await fetch(api_url + "feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify(feedback),
    });
    if (response.status == 201) {
      iziToast.success({
        message: "Feedback Submitted Successfully",
        position: "bottomCenter",
      });
      rating = 0;
    }
  }

  async function populateModuleData() {
    await verifyToken("msToken");
    try {
      checkFeedback();
    } catch (err) {}
    
    await getModuleData(moduleId);
    await fetchTiers()

    // giving heading
    document.getElementById("moduleDetailsModuleTitle").innerHTML = moduleData.title;
    //document.getElementById("subModuleDetails").innerHTML = moduleData.title;
    document.getElementById("username").innerHTML = user.fullName;

    if(user.userType < 0) {
      document.getElementById("username").addEventListener("click" , function(){
        window.location.href = "./ModuleSetup.html"
      }) }
    // fill the list with submodule list.

    //populate subMdoule table
    var filtered = moduleData.subModule;
    filtered.sort((a, b) => a.serialNumber - b.serialNumber);

    filtered.forEach((card) => {
      //console.log(card)
      if (card.status) {
        addToSubmoduleList(card);
        addSubModuleCard(card);
      }
    });
    
    // fill the drop down for tier
    await allTiers.forEach((tier) => {
      if (tier.status == true) {
        createTierButtons(tier)
        // var option = document.createElement("option");
        // option.setAttribute("value", tier._id);
        // option.setAttribute("id", `tierListDropdownOption${tier._id}`);
        // option.innerHTML = tier.title;
        // document.getElementById("tierListDropdown").appendChild(option);
      }
    })

    addEventListenerToTiersButton()

  }

  //book a demo
  async function bookDemo() {
    var phoneNumber = document.getElementById("phoneNumber").value;
    var demoTime = document.getElementById("demoTime").value;
    var remarks = document.getElementById("remarks").value;

    const countryData = iti.getSelectedCountryData();

    var demoForm = {
      phoneNumber: "+" + countryData.dialCode + " " + phoneNumber,
      moduleId: moduleId,
      demoTime: demoTime,
      remarks: remarks,
    };
    var response = await fetch(api_url + "register/bookDemo/" + user._id, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify({ demo: demoForm }),
    });
    if (response.status == 200) {
      $(".btnFeedback").each(function () {
        $(this).hide();
      });
      iziToast.success({
        message: "Demo Request Created",
        position: "bottomCenter",
      });

      rating = 0;
    }
    var data = await response.json();
  }

  //image filter check // return boolean
  function filterMedia(media) {
    var filtered = []
    var tierId = tierIdForFiltering
    var index = allTiers.findIndex((tier) => tier._id == tierId)
    var currentTier = allTiers[index]

    if (index > -1) {
      while (true && currentTier) {
        //console.log(currentTier)
        filtered = filtered.concat(media.filter(obj => obj.tier == currentTier._id))
        if (currentTier.parent == "-1") {
          break;
        } 
        var newIndex = allTiers.findIndex((tier) => tier._id == currentTier.parent)
        currentTier = allTiers[newIndex]
      }
    }
    else {
      
      filtered = media
      
    }
    //console.log(filtered)
    return filtered
  }

  document.getElementById("bookDemo").addEventListener("click", function () {
    bookDemo();
  });

  populateModuleData();

  // event listeners for tier buttons
  function addEventListenerToTiersButton() {
    document.querySelectorAll('[id = "tierButton"]').forEach( (button) => {
      //console.log(button)
      button.addEventListener('click', () => {
        console.log(button.value)
        var tierId = button.value
        tierIdForFiltering = tierId
        var index = allTiers.findIndex((tier) => tier._id == tierId)
  
        var filteredModules = []
        var currentTier = allTiers[index]
        //console.log(currentTier)
        while (true && currentTier) {
          //console.log(currentTier)
          filteredModules = filteredModules.concat(moduleData.subModule.filter(module => module.tier == currentTier._id))
          if (currentTier.parent == "-1") {
            break;
          } 
          var newIndex = allTiers.findIndex((tier) => tier._id == currentTier.parent)
          currentTier = allTiers[newIndex]
        }
        //console.log(filteredModules)
        document.getElementById("subModuleCards").innerHTML = '';
        document.getElementById("subModuleList").innerHTML = '';
        filteredModules.forEach( (module) => {
          addToSubmoduleList(module)
          addSubModuleCard(module)
        })
        if(tierId == 0) {
          allModules.forEach( (module) => {
            addToSubmoduleList(module)
            addSubModuleCard(module)
          })
        }
      })
  
    })
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

var intl_input = document.querySelector(".txtMobileNo");

const iti = window.intlTelInput(intl_input, {
  utilsScript: "../vendor_components/intl-tel-input/build/js/utils.js",
  initialCountry: "in",
  placeholderNumberType: "MOBILE",
  autoPlaceholder: "aggressive",
  allowDropdown: true,
  //dropdownContainer: phoneDropdown,
});

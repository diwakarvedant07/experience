document.addEventListener("DOMContentLoaded", async function () {
  
  var api_url = "http://127.0.0.1:5605/"
  var api_key = "8779bad8-4022-11ee-be56-0242ac120002";
  var allModules;
  var allProducts
  var allTiers;
  var sortOrder = [];
  var sortOrderId;
  var sortProductOrder = [];
  var sortProductOrderId = [];
  var token;
  var user;
  var mediaType;

  // App init - Basic Flow
    try {

    token = getCookie("msToken")

    //verify the token validity
    await verifyToken("msToken")
    
    // add user name to the top
    document.getElementById('username').innerHTML = user.fullName;

    // check admin access and basic app flow
    if (user.userType != -1) {
      window.location.href = "./Modules.html";
    }
    try {
          //get product data 
          await fetchProducts();
          //console.log(allProducts)
    } catch (e) {
      console.log(e)
    }

    try {
          //get data
          await fetchModules();
    } catch (e) {
      console.log(e)
    }


    try {
          //get tier data
          await fetchTiers()
    } catch (e) {
      console.log(e)
    }


    // populate the app
    populateAppAndAddFunctionality()

    //media based input
    initMediaTypeBasedInput()

    // start dragula
    initDragula();

  } 
   catch (e) {
     console.log(e)
   }

  //constructors for product data
  class ProductData {
    constructor(title, description, status, icon, demonstratorEmail) {
      this.title = title;
      this.description = description;
      this.status = status;
      this.icon = icon;
      this.demonstratorEmail = demonstratorEmail;
    }
  }
  //constructors for module data
  class ModuleData {
    constructor(tier, productId, title, description, status, icon, demonstratorEmail, subModules) {
      this.tier = tier;
      this.productId = productId;
      this.title = title;
      this.description = description;
      this.status = status;
      this.icon = icon;
      this.demonstratorEmail = demonstratorEmail;
      this.subModules = subModules;
    }
  }
  //constructors for subModule data
  class SubModuleData {
    constructor(tier, title, status, description, media, serialNumber, mediaType) {
      this.tier = tier;
      this.title = title;
      this.description = description;
      this.status = status;
      this.media = media;
      this.serialNumber = serialNumber;
      this.mediaType = mediaType;
    }
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
  
  // verify validity of token
  async function verifyToken(name) {
    token = await getCookie("msToken")
    //token = localStorage.getItem("msExpToken");
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
        // console.log('token verified')
      }

      else if (response.status == 403) {
        deleteCookie("msToken")
        //localStorage.removeItem("msExpToken")
        window.location.href = "./SignIn.html";
      }

      var data = await response.json();
      user = data;
    }
    else {
      window.location.href = "./SignIn.html";
    }
  }

  // Fetch all products.
  async function fetchProducts() {
    var response = await fetch(api_url + "product", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
        "x-access-token": token,
      },
    });
    var data = await response.json();
    allProducts = data;

    var sortProductOrderStr = allProducts[0].demonstratorEmail;
    sortProductOrder = sortProductOrderStr.map(function (str) {
      // using map() to convert array of strings to numbers

      return parseInt(str);
    });
    sortProductOrderId = allProducts[0]._id;
    allProducts.splice(0, 1);

  }

  // Fetch all modules.
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

  // Fetch all Tiers.
  async function fetchTiers() {
      var response = await fetch(api_url + "tier", {
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

  // create product card function
  async function createProductCard(product) {
    var status;
    var statusAttr;

    if (product.status == true) {
      status = "Active";
      statusAttr = "badge-success";
    } else {
      status = "Inactive";
      statusAttr = "badge-danger";
    }
    //create product cards for the editing table
    var tbody = document.createElement("tr");
    tbody.innerHTML = `
    <td><button type="button" class="btn btn-primary btn-outline py-1 px-2" id=""><i class="bi bi-arrows-move"></i></button></td>
    <td value = ${product.serialNumber}><button type="button" class="btn btn-primary btn-outline py-1 px-2" id="productCard ${product._id}"><i class="bi bi-pencil"></i></button></td>
    <td id="product_title ${product._id}">${product.title}</td>
    <td>
      <div class="d-inline-flex justify-content-center align-items-center bg-primary px-3 py-2 rounded-1">
            <i class="${product.icon}" id="product_icon ${product._id}"></i>
      </div>
    </td>
      <td><span class="badge ${statusAttr}" id="product_status ${product._id}">${status}</span></td>
      <td> <span class="badge badge-danger" id="product_delete ${product._id}">Delete</span> </td>
    `;
    document.getElementById("productEditingTable").appendChild(tbody);
    //adding event listeners on the edit icon of each product card
    document.getElementById(`productCard ${product._id}`).addEventListener("click", () => {
        var index = allProducts.findIndex((item) => item._id === product._id);

        if (CKEDITOR.instances["newProductDescription"]) {
          CKEDITOR.instances["newProductDescription"].destroy();
        }

        CKEDITOR.replace("newProductDescription");
        $("#modalAddProduct").appendTo("body").modal("show");
        document.getElementById("newProductTitle").value = allProducts[index].title;
        document.getElementById("newProductTitle").setAttribute("value", allProducts[index]._id);
        document.getElementById("newProductDescription").value = allProducts[index].description;
        CKEDITOR.instances["newProductDescription"].setData(allProducts[index].description);
        document.getElementById(`newProductStatus`).setAttribute("aria-pressed", allProducts[index].status);
        
        if (allProducts[index].status == true) {
          document.getElementById(`newProductStatus`).classList.add("active");
        }
        else if (allProducts[index].status == false) {
          document.getElementById(`newProductStatus`).classList.remove("active");
        }
        document.getElementById("newProductIcon").value = allProducts[index].icon;
        document.getElementById("newProductSubmit").innerHTML = "Update";
      });

    //adding event listener for Delete button
    var deleteBadge = tbody.querySelector(`[id="product_delete ${product._id}`);
    deleteBadge.style.cursor = "pointer";

    deleteBadge.addEventListener("click", () => {
      console.log("deleting : ", product._id);
      deleteProduct(product._id);
    })

    //adding event listener for status button
    var toggleBadge = tbody.querySelector(`[id="product_status ${product._id}"]`);
    toggleBadge.style.cursor = "pointer";

    toggleBadge.addEventListener("click", async function () {
      var T;
      if (toggleBadge.classList.contains("badge-success")) {
        toggleBadge.className = "badge badge-danger";
        toggleBadge.innerHTML = "Inactive";
        T = false
        //console.log(status);
      } else if (toggleBadge.classList.contains("badge-danger")) {
        toggleBadge.className = "badge badge-success";
        toggleBadge.innerHTML = "Active";
        T = true
        //console.log(status);
      }
      var index = allProducts.findIndex(item => item._id == product._id)
      allProducts[index].status = T;
      var response = await fetch(
        api_url + "product/" + product._id,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-auth-token": api_key,
            "x-access-token": token,
          },
          body: JSON.stringify(allProducts[index]),
        }
      );
      if (response.status == 200) {
        iziToast.success({ message: `${allProducts[index].title} Product is ${toggleBadge.innerHTML}`, position: 'bottomLeft' });
      }
      else if (response.status == 400) {
        iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
      }

      var data = await response.json();
    });

    // create li element for the list in the subproduct section.
if(product.status == true){
    var option = document.createElement("option");
    option.setAttribute("value", product._id);
    option.setAttribute("id", `productListDropdownOption${product._id}`);
    option.innerHTML = product.title;
    document.getElementById("productListDropdown").appendChild(option);

    var option = document.createElement("option");
    option.setAttribute("value", product._id);
    option.setAttribute("id", `productListDropdownOption${product._id}`);
    option.innerHTML = product.title;
    document.getElementById("productListDropdownModal").appendChild(option);
}

        
  // ********** //
  //delete Product.
  async function deleteProduct(productId){
          var index = allProducts.findIndex(_id => _id == productId)
          let productName = allProducts[index]
          allProducts.splice(index, 1)
          
          Swal.fire({
            title: `Delete: ${productName}`,
            text: 'Are you sure, you want to delete this product?',
            icon: 'warning',
            confirmButtonText: 'Confirm Delete',
            confirmButtonColor: "red",
            showCancelButton: true
          }).then(async (result) => {
            
            if (result.isConfirmed) {
              var response = await fetch(api_url + `product/${productId}`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json",
                    "x-auth-token": api_key,
                    "x-access-token": token,
                },
                });
                if(response.status == 200) {
                  const productRow = document.getElementById(`product_title ${productId}`)
                  productRow.parentElement.style.display = "none";
                  console.log(productRow.parentElement)
                }
                var data = await response.json();
                console.log(data);
            }
          })


  }

  } 
  // create module card function
  async function createModuleCard(module) {
      var status;
      var statusAttr;
  
      if (module.status == true) {
        status = "Active";
        statusAttr = "badge-success";
      } else {
        status = "Inactive";
        statusAttr = "badge-danger";
      }
      //create module cards for the editing table
      var tbody = document.createElement("tr");
      tbody.innerHTML = `
      <td><button type="button" class="btn btn-primary btn-outline py-1 px-2" id=""><i class="bi bi-arrows-move"></i></button></td>
      <td value = ${module.serialNumber}><button type="button" class="btn btn-primary btn-outline py-1 px-2" id="moduleCard ${module._id}"><i class="bi bi-pencil"></i></button></td>
      <td id="module_title ${module._id}">${module.title}</td>
      <td>
        <div class="d-inline-flex justify-content-center align-items-center bg-primary px-3 py-2 rounded-1">
              <i class="${module.icon}" id="module_icon ${module._id}"></i>
        </div>
      </td>
        <td><span class="badge ${statusAttr}" id="module_status ${module._id}">${status}</span></td>
        <td><span class="badge badge-danger" id="module_delete ${module._id}">Delete</span></td>
      `;
      document.getElementById("moduleEditingTable").appendChild(tbody);
      //adding event listeners on the edit icon of each module card
      document.getElementById(`moduleCard ${module._id}`).addEventListener("click", () => {
          var index = allModules.findIndex((item) => item._id === module._id);
  
          if (CKEDITOR.instances["newModuleDescription"]) {
            CKEDITOR.instances["newModuleDescription"].destroy();
          }
  
          CKEDITOR.replace("newModuleDescription");
          $("#modalAddModule").appendTo("body").modal("show");
          document.getElementById("newModuleTitle").value = allModules[index].title;
          document.getElementById("newModuleTitle").setAttribute("value", allModules[index]._id);
          document.getElementById("newModuleDescription").value = allModules[index].description;
          document.getElementById("moduleTierListDropdownModal").value = allModules[index].tier
          document.getElementById("productListDropdownModal").value = allModules[index].productId
          CKEDITOR.instances["newModuleDescription"].setData(allModules[index].description);
          document.getElementById(`newModuleStatus`).setAttribute("aria-pressed", allModules[index].status);
          
          if (allModules[index].status == true) {
            document.getElementById(`newModuleStatus`).classList.add("active");
          }
          else if (allModules[index].status == false) {
            document.getElementById(`newModuleStatus`).classList.remove("active");
          }
          document.getElementById("newModuleIcon").value = allModules[index].icon;
          document.getElementById("newModuleSubmit").innerHTML = "Update";
        });
        
      //adding event listener for delete button
      var deleteBadge = tbody.querySelector(`[id="module_delete ${module._id}`);
      deleteBadge.style.cursor = "pointer";

      deleteBadge.addEventListener("click", () => {
        console.log("deleting : ", module._id);
      })

      // active inactive button
      var toggleBadge = tbody.querySelector(`[id="module_status ${module._id}"]`);
      toggleBadge.style.cursor = "pointer";
      toggleBadge.addEventListener("click", async function () {
        var T;
        if (toggleBadge.classList.contains("badge-success")) {
          toggleBadge.className = "badge badge-danger";
          toggleBadge.innerHTML = "Inactive";
          T = false
          //console.log(status);
        } else if (toggleBadge.classList.contains("badge-danger")) {
          toggleBadge.className = "badge badge-success";
          toggleBadge.innerHTML = "Active";
          T = true
          //console.log(status);
        }
        var index = allModules.findIndex(item => item._id == module._id)
        allModules[index].status = T;
        var response = await fetch(
          api_url + "module/" + module._id,
          {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              "x-auth-token": api_key,
              "x-access-token": token,
            },
            body: JSON.stringify(allModules[index]),
          }
        );
        if (response.status == 200) {
          iziToast.success({ message: `${allModules[index].title} Module is ${toggleBadge.innerHTML}`, position: 'bottomLeft' });
        }
        else if (response.status == 400) {
          iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
        }
  
        var data = await response.json();
      });
  
      // create li element for the list in the submodule section.
      document.getElementById("moduleListDropdown").innerHTML = `
      <option value="0">Please Select</option>
      `
      document.getElementById("moduleListDropdownModal").innerHTML = `
      <option value="0">Please Select</option>
      `
      allModules.forEach((aModule) => {
        if(aModule.status == true) {
          var option = document.createElement("option");
          option.setAttribute("value", aModule._id);
          option.setAttribute("id", `moduleListDropdownOption${aModule._id}`);
          option.innerHTML = aModule.title;
          document.getElementById("moduleListDropdown").appendChild(option);
          var option = document.createElement("option");
          option.setAttribute("value", aModule._id);
          option.setAttribute("id", `moduleListDropdownOption${aModule._id}`);
          option.innerHTML = aModule.title;
          document.getElementById("moduleListDropdownModal").appendChild(option);
        }
      })
      // ********** //
      //delete module
      async function deleteModule(moduleId){
        var index = allModules.media.findIndex(_id => _id == productId)
        let moduleName = allModules[index]
        allModules.media.splice(index, 1)

        Swal.fire({
          title: `Delete: ${moduleName}`,
          text: 'Are you sure, you want to delete this product? \n Please confirm if you want to delete sub-Modules as well.',
          icon: 'warning',
          buttons: {
            deleteWithSubModules: "delete with sub",
            deleteWithoutSubModules: "save subModules",
          },
          showCancelButton: true
        }).then(async (result) => {
            switch(result) {
              case 'deleteWithSubModules':
                console.log("deleting with the subModules");
                //delete request
                var response = await fetch(api_url + `module/${moduleId}`, {
                  method: "DELETE",
                  headers: {
                      "content-type": "application/json",
                      "x-auth-token": api_key,
                      "x-access-token": token,
                  },
                  });
                  var data = await response.json();
                  console.log(data);

                break;

              case 'deleteWithoutSubModules':
                console.log("deleting without the subModules")
                break;
            }
        })
        
      }
  } 
  // create subModule card function
  async function createSubModuleCard(item, moduleId) {
      var status;
      var statusAttr;
      var index = await allModules.findIndex((item) => item._id == moduleId);
      var subModuleIndex = await allModules[index].subModule.findIndex(subItem => subItem._id == item._id);
      var subModule = allModules[index].subModule[subModuleIndex];
      
      var tbody = document.createElement("tr");
      tbody.setAttribute("data-value", subModule.serialNumber);
      tbody.setAttribute("value", moduleId);
      if (subModule.status == true) {
        status = "Active";
        statusAttr = "badge-success";
      } else {
        status = "Inactive";
        statusAttr = "badge-danger";
      }
      tbody.innerHTML = `
          <td><button type="button" class="btn btn-primary btn-outline py-1 px-2" id=""><i class="bi bi-arrows-move"></i></button></td>
          <td value="${subModule.serialNumber}">
            <div class="d-flex">
              <button type="button" class="btn btn-primary btn-outline py-1 px-2" data-bs-target="#modalAddSubModule" data-bs-toggle="modal" id="subModuleCard ${item._id}"><i class="bi bi-pencil"></i></button>
              <button type="button" class="btn btn-primary btn-outline py-1 px-2 ms-2" id="viewSubModuleCard ${item._id}"><i class="bi bi-eye"></i></button>
            </div>
          </td>
          <td id="subModule_title ${item._id}">${subModule.title}</td>
          <td><span id="subModule_status ${item._id}" class="badge ${statusAttr}">${status}</span></td>
          <td><span id="subModule_delete ${item._id}" class="badge badge-danger">Delete</span></td>
              `;
      document.getElementById("subModuleTable").appendChild(tbody);
      //adding event listeners on the edit icon of each SubModule card
      document.getElementById(`subModuleCard ${item._id}`).addEventListener("click",async () => {
        var index = await allModules.findIndex((item) => item._id == moduleId);
        var subModuleIndex = await allModules[index].subModule.findIndex(subItem => subItem._id == item._id);
        var subModule = allModules[index].subModule[subModuleIndex];
        if (CKEDITOR.instances["newSubModuleDescription"]) {
          CKEDITOR.instances["newSubModuleDescription"].destroy();
        }
  
        CKEDITOR.replace("newSubModuleDescription");
  
        $("#modalAddSubModule").appendTo("body").modal("show");
        document.getElementById("newSubModuleTitle").value = subModule.title;
        document.getElementById("newSubModuleTitle").setAttribute("value", item._id);
        document.getElementById("newSubModuleDescription").value = subModule.description;
        document.getElementById("subModuleTierListDropdownModal").value = subModule.tier;
        document.getElementById("moduleListDropdownModal").value = moduleId;
        document.getElementById(`newSubModuleStatus`).setAttribute("aria-pressed", subModule.status);
        if (subModule.status == true) {
          document.getElementById(`newSubModuleStatus`).classList.add("active");
        }
        else if (subModule.status == false) {
          document.getElementById(`newSubModuleStatus`).classList.remove("active");
        }
        document.getElementById("newSubModuleSubmit").innerHTML = "Update";
        var i = 0;
        document.getElementById("inputTable").innerHTML = "";
        if (subModule.mediaType == 1) {
          //console.log("mediaType 1 ")
          document.getElementById("radioButtonsInModal").innerHTML = `
          <div class="form-group" id="mediaConfig">
            <input type="radio" id="media-type-image" value="1" name="media-type">
            <label for="media-type-image">Images</label>
            <br>
            <input type="radio" id="media-type-video" value="2" name="media-type">
            <label for="media-type-video">Video</label>
            <br>
            <input type="radio" id="media-type-url" value="3" name="media-type">
            <label for="media-type-url">URL</label>
            <br>
            <div class="invalid-feedback">
              Please Enter label name
            </div>
          </div>
          `
          document.getElementById("media-type-image").setAttribute("checked","")
          document.getElementById("addInputField").style.display = "block"
        }
        else if (subModule.mediaType == 2) {
          //console.log("mediaType 2 ")
          document.getElementById("radioButtonsInModal").innerHTML = `
          <div class="form-group" id="mediaConfig">
            <input type="radio" id="media-type-image" value="1" name="media-type">
            <label for="media-type-image">Images</label>
            <br>
            <input type="radio" id="media-type-video" value="2" name="media-type">
            <label for="media-type-video">Video</label>
            <br>
            <input type="radio" id="media-type-url" value="3" name="media-type">
            <label for="media-type-url">URL</label>
            <br>
            <div class="invalid-feedback">
              Please Enter label name
            </div>
          </div>
          `
          document.getElementById("media-type-video").setAttribute("checked","")
          document.getElementById("addInputField").style.display = "none"
          // document.getElementById("mediaDisplay-0").innerHTML = `
          // <video src="${subModule.media[0].link}"></video>
          // `
        }
        else if (subModule.mediaType == 3) {
          //console.log("mediaType 3 ")
          document.getElementById("radioButtonsInModal").innerHTML = `
          <div class="form-group" id="mediaConfig">
            <input type="radio" id="media-type-image" value="1" name="media-type">
            <label for="media-type-image">Images</label>
            <br>
            <input type="radio" id="media-type-video" value="2" name="media-type">
            <label for="media-type-video">Video</label>
            <br>
            <input type="radio" id="media-type-url" value="3" name="media-type">
            <label for="media-type-url">URL</label>
            <br>
            <div class="invalid-feedback">
              Please Enter label name
            </div>
          </div>
          `
          document.getElementById("media-type-url").setAttribute("checked","")
          document.getElementById("addInputField").style.display = "none"

        }
        subModule.media.forEach(obj => {
          var tr = document.createElement("tr")
          tr.innerHTML = `
          <td width="5%"><button type="button" class="btn btn-primary btn-outline py-1 px-2" id=""><i class="bi bi-arrows-move"></i></button></td>
          <td width="30%" id="mediaDisplay-${i}"> <img src="${obj.link}"> </td>
          <td width="30%"> <input type="text" placeholder="Enter Caption" id="caption-${i}" value="${obj.caption}"/> </td>
          <td width="30%">
          <select class="form-control select2 form-select required-select2-validation" id="tierListDropdown-${i}" name="ddl" tabindex="1">
            <option value="0">Please Select</option>
          </select>
        </td>
          <td width="5%"> <button class="btn btn-primary" id="deleteExistingInputField${i}"> Delete </button> </td>
          `
          document.getElementById("inputTable").appendChild(tr)
          document.getElementById(`deleteExistingInputField${i}`).addEventListener("click", function(e){
            e.preventDefault()
            var index = subModule.media.findIndex(media => media == obj)
            subModule.media.splice(index, 1)
            tr.remove()
          }) 

          allTiers.forEach(tier => {
            var option = document.createElement("option");
            option.setAttribute("value", tier._id);
            option.setAttribute("id", `tierListDropdownOption${tier._id}`);
            option.innerHTML = tier.title;
            document.getElementById(`tierListDropdown-${i}`).appendChild(option);
          })
          document.getElementById(`tierListDropdown-${i}`).value = obj.tier
          
          mediaType = subModule.mediaType
          i++
        })
        // document.getElementById("addInputField").addEventListener("click", function(e) {
        //   e.preventDefault()
        //   i++
        //   var tr = document.createElement("tr")
        //   tr.innerHTML = `
        //   <td> <input type="file" class="form-control" placeholder="e.g. " id="files-${i}"
        //   name="file" tabindex="1" spellcheck="true"> </td>
        //   <td> <button class="btn btn-primary"> View </button> </td>
        //   <td> <input type="text" placeholder="Enter Caption"> </td>
        //   <td> <button class="btn btn-primary" id="deleteInputField${i}"> Delete </button> </td>
        //   `
        //   document.getElementById("inputTable").appendChild(tr)
        //   document.getElementById(`deleteInputField${i}`).addEventListener("click", function(e){
        //     e.preventDefault()
        //     tr.remove()
        //   }) 
        // })
        document.getElementById("inputTable").setAttribute("data-moduleId" , moduleId)
        document.getElementById("inputTable").setAttribute("data-subModuleId" , item._id)
  
      });
  
      //adding event listener for delete button
      var deleteBadge = tbody.querySelector(`[id="subModule_delete ${item._id}`);
      deleteBadge.style.cursor = "pointer";

      deleteBadge.addEventListener("click", () => {
        console.log("deleting : ", item._id);
      })

      var toggleBadge = tbody.querySelector(
        `[id="subModule_status ${item._id}"]`
      );
      toggleBadge.style.cursor = "pointer";
      toggleBadge.addEventListener("click", async function () {
        var T;
        if (toggleBadge.classList.contains("badge-success")) {
          toggleBadge.className = "badge badge-danger";
          toggleBadge.innerHTML = "Inactive";
          T = false
          //console.log(status);
        } else if (toggleBadge.classList.contains("badge-danger")) {
          toggleBadge.className = "badge badge-success";
          toggleBadge.innerHTML = "Active";
          T = true
          //console.log(status);
        }
        var index = allModules.findIndex(module => module._id == moduleId)
        var subIndex = allModules[index].subModule.findIndex(subItem => subItem._id == item._id)
        allModules[index].subModule[subIndex].status = T;
        var response = await fetch(
          api_url + "module/" + moduleId,
          {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
              "x-auth-token": api_key,
              "x-access-token": token,
            },
            body: JSON.stringify(allModules[index]),
          }
        );
        if (response.status == 200) {
          iziToast.success({ message: `${allModules[index].subModule[subIndex].title} Sub-Module is ${toggleBadge.innerHTML}`, position: 'bottomLeft' });
        }
        else if (response.status == 400) {
          iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
        }
        var data = await response.json();
      });
  
      document.getElementById(`viewSubModuleCard ${item._id}`).addEventListener("click", () => {
  
        $("#modalSMView").appendTo("body").modal("show");
        document.getElementById("aniimated-thumbnials").innerHTML = '';
        document.getElementById("viewSubModuleTitle").innerHTML = subModule.title;
        document.getElementById("viewSubModuleDescription").innerHTML = subModule.description;
        document.getElementById("viewSubModuleStatus").setAttribute("aria-pressed", subModule.status);
        if (item.status == true) {
          document.getElementById("viewSubModuleStatus").innerHTML = "Active";
          document.getElementById("viewSubModuleStatus").setAttribute("class", "badge badge-success");
          document.getElementById("viewSubModuleStatus").classList.add("active");
        } else {
          document.getElementById("viewSubModuleStatus").innerHTML = "Inactive";
          document.getElementById("viewSubModuleStatus").setAttribute("class", "badge badge-danger");
          document.getElementById("viewSubModuleStatus").classList.remove("active");
        }
  
        subModule.media.forEach(link => {
          var div = document.createElement("div")
          div.className = "col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-3"
          div.innerHTML = `
                  <a href="${link}" data-fancybox="gallery">
                  <img class="img-responsive thumbnail" src="${link}" alt="">
                  </a>
        `;
          Fancybox.bind('[data-fancybox="gallery"]', {
            // Your custom options
          });
          document.getElementById("aniimated-thumbnials").appendChild(div)
  
        })
      });
  }

  //media type of input for subModules
  function initMediaTypeBasedInput() {
    
    var i=30;
    document.querySelectorAll('[name="media-type"]').forEach((radioInput) => {
      radioInput.addEventListener('click', () => {
        i=30
        mediaType = radioInput.getAttribute("value")
        // console.log(radioInput.getAttribute("value"))
        if(mediaType == 1) {
          
          document.getElementById("inputTable").innerHTML = `
          <tr>
          <td> <input type="file" class="form-control" placeholder="e.g. " id="files-${i}"
          name="file" tabindex="1" spellcheck="true"> </td>
          <td> <p style="border-width:1px; border-style:solid; border-color:black; padding: 1em;"> View </p> </td>
          <td><input type="text" placeholder="Enter Caption" id=caption-${i}></td>
          <td>
            <select class="form-control select2 form-select required-select2-validation" id="tierListDropdown-${i}" name="ddl" tabindex="1">
              <option value="0">Please Select</option>
            </select>
          </td>
          <td>
            <button class="btn btn-primary" type="button" id="deleteInputField${i}"> Delete </button>
          </td>
          </tr>
          `
          document.getElementById("addInputField").style.display = "block"
        }
        else if(mediaType == 2) {
          document.getElementById("inputTable").innerHTML = `
          <tr>
          <td> <input type="file" class="form-control" placeholder="e.g. " id="files-${i}"
          name="file" tabindex="1" spellcheck="true"> </td>
          <td> <p style="border-width:1px; border-style:solid; border-color:black; padding: 1em;"> View </p> </td>
          <td> <input type="text" placeholder="Enter Caption" id=caption-${i}> </td>
          <td>
            <select class="form-control select2 form-select required-select2-validation" id="tierListDropdown-${i}" name="ddl" tabindex="1">
              <option value="0">Please Select</option>
            </select>
          </td>
          <td> <button class="btn btn-primary" type="button" id="deleteInputField${i}"> Delete </button> </td>
          </tr>
          `
          document.getElementById("addInputField").style.display = "none"
        }
        else if(mediaType == 3) {
          document.getElementById("inputTable").innerHTML = `
          <tr>
          <td> <input type="text" class="form-control" placeholder="e.g. " id="files-${i}"
          name="file" tabindex="1" spellcheck="true"> </td>
          <td> <p style="border-width:1px; border-style:solid; border-color:black; padding: 1em;"> View </p> </td>
          <td> <input type="text" placeholder="Enter Caption" id=caption-${i}> </td>
          <td>
            <select class="form-control select2 form-select required-select2-validation" id="tierListDropdown-${i}" name="ddl" tabindex="1">
              <option value="0">Please Select</option>
            </select>
          </td>
          <td> <button class="btn btn-primary" type="button" id="deleteInputField${i}"> Delete </button> </td>
          </tr>
          `
          document.getElementById("addInputField").style.display = "none"
        }

        document.getElementById(`deleteInputField${i}`).addEventListener("click", (e) => {
          e.preventDefault()
          document.getElementById(`deleteInputField${i}`).parentElement.parentElement.remove()
        })
        allTiers.forEach(tier => {
          var option = document.createElement("option");
          option.setAttribute("value", tier._id);
          option.setAttribute("id", `tierListDropdownOption${tier._id}`);
          option.innerHTML = tier.title;
          document.getElementById(`tierListDropdown-${i}`).appendChild(option);
        })
      })
    })

    document.getElementById("addInputField").addEventListener("click", function(e) {
      e.preventDefault()
      i++
      var tr = document.createElement("tr")
      tr.innerHTML = `
      <td> <input type="file" class="form-control" placeholder="e.g. " id="files-${i}"
      name="file" tabindex="1" spellcheck="true"> </td>
      <td> <p style="border-width:1px; border-style:solid; border-color:black; padding: 1em;"> View </p> </td>
      <td> <input type="text" placeholder="Enter Caption" id=caption-${i} /> </td>
      <td>
        <select class="form-control select2 form-select required-select2-validation" id="tierListDropdown-${i}" name="ddl" tabindex="1">
          <option value="0">Please Select</option>
        </select>
      </td>
      <td> <button class="btn btn-primary" type="button" id="deleteInputField${i}"> Delete </button> </td>
      `
      document.getElementById("inputTable").appendChild(tr)
      document.getElementById(`deleteInputField${i}`).addEventListener("click", function(e){
        e.preventDefault()
        tr.remove()
      })
      allTiers.forEach(tier => {
        var option = document.createElement("option");
        option.setAttribute("value", tier._id);
        option.setAttribute("id", `tierListDropdownOption${tier._id}`);
        option.innerHTML = tier.title;
        document.getElementById(`tierListDropdown-${i}`).appendChild(option);
      })
    })
  }

  // creates module table, submodule table and module list dropdown. adds functionality to submit buttons and modal buttons
  function populateAppAndAddFunctionality() {

        // sorting products by serial number
        try {
          var sortedAllProducts = allProducts.sort(function (a, b) {
            return (
                sortProductOrder.indexOf(a.serialNumber) - sortProductOrder.indexOf(b.serialNumber)
              );
            });
          
            // populating module data on module table and dropdowns
            sortedAllProducts.forEach((product) => {
              createProductCard(product);
            });
        } catch(e){ 
          console.log(e)
        }

        // sorting modules by serial number
        var sortedAllModules = allModules.sort(function (a, b) {
          return (
            sortOrder.indexOf(a.serialNumber) - sortOrder.indexOf(b.serialNumber)
          );
        });

        // populating module data on module table and dropdowns
        sortedAllModules.forEach((module) => {
          createModuleCard(module);
        });

        // add module modal functionality and saving new module data to database.
        document.getElementById("openAddModule").addEventListener("click", () => {
          //clearing the modal form
          $('#IconModal').appendTo('#modalAddModule');
          document.getElementById("newModuleTitle").value = ""
          document.getElementById("moduleTierListDropdownModal").value = ""
          // 
          document.getElementById("newModuleStatus").classList.add("active")
          document.getElementById("newModuleStatus").setAttribute("aria-pressed", "true")
          try {
            document.getElementById("productListDropdownModal").value = document.getElementById("productListDropdown").value
            CKEDITOR.instances["newModuleDescription"].setData("");
          } catch (e) {
          }

          document.getElementById("newModuleIcon").value = ""

          if (CKEDITOR.instances["newModuleDescription"]) {
            CKEDITOR.instances["newModuleDescription"].destroy();
          }

          CKEDITOR.replace("newModuleDescription");

          document.getElementById("newModuleSubmit").innerHTML = "Submit";
          $("#modalAddModule").appendTo("body").modal("show");
        });
        document.getElementById("newModuleSubmit").addEventListener("click", async () => {
          //new module
          if (document.getElementById("newModuleSubmit").innerHTML == "Submit") {
            newModuleData = new ModuleData();
            newModuleData.title = document.getElementById("newModuleTitle").value;
            newModuleData.productId = document.getElementById("productListDropdownModal").value;
            newModuleData.tier = document.getElementById("moduleTierListDropdownModal").value
            newModuleData.description =
              CKEDITOR.instances["newModuleDescription"].getData();
            //document.getElementById("newModuleDescription").value;

            newModuleData.status = document
              .getElementById("newModuleStatus")
              .getAttribute("aria-pressed");
            newModuleData.icon = document.getElementById("newModuleIcon").value;

            // var serialNumber = sortOrder.length
            // newModuleData.serialNumber = serialNumber + 1
            // sortOrder.push(`${serialNumber + 1}`)

            var response = await fetch(api_url + "module", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-auth-token": api_key,
                "x-access-token": token,
              },
              body: JSON.stringify(newModuleData),
            });
            if (response.status == 201) {
              iziToast.success({ message: 'Module Added Successfully' });
              $("#modalAddSubModule").modal("hide");
            }
            else if (response.status == 400) {
              iziToast.error({ message: 'Exception Occured' });
            }
            var data = await response.json();
            

            createModuleCard(data);
            allModules.push(data);
          }
          //update the module
          if (document.getElementById("newModuleSubmit").innerHTML == "Update") {
            var newModuleData = new ModuleData();
            newModuleData.title = document.getElementById("newModuleTitle").value;
            newModuleData.description = CKEDITOR.instances["newModuleDescription"].getData();
            newModuleData.productId = document.getElementById("productListDropdownModal").value;
            newModuleData.tier = document.getElementById("moduleTierListDropdownModal").value
            //document.getElementById("newModuleDescription").value;
            newModuleData.status = document.getElementById("newModuleStatus").getAttribute("aria-pressed");
            newModuleData.icon = document.getElementById("newModuleIcon").value;
            var id = document.getElementById("newModuleTitle").getAttribute("value");
            var response = await fetch(api_url + "module" + `/${id}`, {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
                "x-auth-token": api_key,
                "x-access-token": token,
              },
              body: JSON.stringify(newModuleData),
            });
            if (response.status == 200) {
              iziToast.success({ message: "Module Updated Successfully", position: 'bottomLeft' });
              $("#modalAddModule").modal("hide");
            }
            else if (response.status == 400) {
              iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
            }
            var data = await response.json();
            document.getElementById(`module_title ${id}`).innerHTML = newModuleData.title;
            //document.getElementById(`module_description ${id}`).innerHTML = newModuleData.description;
            
            document.getElementById("newModuleDescription").value = newModuleData.description;
            var status;
            var statusAttr;
            if (newModuleData.status == "true") {
              status = "Active";
              statusAttr = "badge-success";
            } else {
              status = "Inactive";
              statusAttr = "badge-danger";
            }
            document.getElementById(`module_status ${id}`).innerHTML = status;
            document.getElementById(`module_status ${id}`).setAttribute("class", `badge ${statusAttr}`);
            document.getElementById(`module_icon ${id}`).className = data.icon;

            //making changes locally
            const index = allModules.findIndex((item) => item._id == id);
            allModules.splice(index, 1);
            allModules.push(data);
          }
        });

        // add product modal functionality and saving new product data to database.
        document.getElementById("openAddProduct").addEventListener("click", () => {
          console.log("Add Product")
          //clearing the modal form
          $('#IconModal').appendTo('#modalAddProduct')
          document.getElementById("newProductTitle").value = ""
          document.getElementById("newProductStatus").classList.add("active")
          document.getElementById("newProductStatus").setAttribute("aria-pressed", "true")
          try {
            CKEDITOR.instances["newProductDescription"].setData("");
          } catch (e) {
          }

          document.getElementById("newProductIcon").value = ""

          if (CKEDITOR.instances["newProductDescription"]) {
            CKEDITOR.instances["newProductDescription"].destroy();
          }

          CKEDITOR.replace("newProductDescription");

          document.getElementById("newProductSubmit").innerHTML = "Submit";
          $("#modalAddProduct").appendTo("body").modal("show");
        });
        document.getElementById("newProductSubmit").addEventListener("click", async () => {
          //new product
          if (document.getElementById("newProductSubmit").innerHTML == "Submit") {
            newProductData = new ProductData();
            newProductData.title = document.getElementById("newProductTitle").value;
            newProductData.description =
              CKEDITOR.instances["newProductDescription"].getData();
            //document.getElementById("newProductDescription").value;

            newProductData.status = document
              .getElementById("newProductStatus")
              .getAttribute("aria-pressed");
            newProductData.icon = document.getElementById("newProductIcon").value;

            // var serialNumber = sortOrder.length
            // newProductData.serialNumber = serialNumber + 1
            // sortOrder.push(`${serialNumber + 1}`)

            var response = await fetch(api_url + "product", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-auth-token": api_key,
                "x-access-token": token,
              },
              body: JSON.stringify(newProductData),
            });
            if (response.status == 201) {
              iziToast.success({ message: 'Product Added Successfully' });
              $("#modalAddSubProduct").modal("hide");
            }
            else if (response.status == 400) {
              iziToast.error({ message: 'Exception Occured' });
            }
            var data = await response.json();
            

            createProductCard(data);
            allProducts.push(data);
          }
          //update the product
          if (document.getElementById("newProductSubmit").innerHTML == "Update") {
            var newProductData = new ProductData();
            newProductData.title = document.getElementById("newProductTitle").value;
            newProductData.description = CKEDITOR.instances["newProductDescription"].getData();
            //document.getElementById("newProductDescription").value;
            newProductData.status = document.getElementById("newProductStatus").getAttribute("aria-pressed");
            newProductData.icon = document.getElementById("newProductIcon").value;
            var id = document.getElementById("newProductTitle").getAttribute("value");
            var response = await fetch(api_url + "product" + `/${id}`, {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
                "x-auth-token": api_key,
                "x-access-token": token,
              },
              body: JSON.stringify(newProductData),
            });
            if (response.status == 200) {
              iziToast.success({ message: "Product Updated Successfully", position: 'bottomLeft' });
              $("#modalAddProduct").modal("hide");
            }
            else if (response.status == 400) {
              iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
            }
            var data = await response.json();
            document.getElementById(`product_title ${id}`).innerHTML = newProductData.title;
            //document.getElementById(`product_description ${id}`).innerHTML = newProductData.description;
            
            document.getElementById("newProductDescription").value = newProductData.description;
            var status;
            var statusAttr;
            if (newProductData.status == "true") {
              status = "Active";
              statusAttr = "badge-success";
            } else {
              status = "Inactive";
              statusAttr = "badge-danger";
            }
            document.getElementById(`product_status ${id}`).innerHTML = status;
            document.getElementById(`product_status ${id}`).setAttribute("class", `badge ${statusAttr}`);
            document.getElementById(`product_icon ${id}`).className = data.icon;

            //making changes locally
            const index = allProducts.findIndex((item) => item._id == id);
            allProducts.splice(index, 1);
            allProducts.push(data);
          }
        });

        // create submodule table after selection of module
        document.getElementById(`productListDropdown`).addEventListener("change", () => {
          // destroy the table
          document.getElementById(`productListDropdownModal`).value = document.getElementById(`productListDropdown`).value
          document.getElementById("moduleEditingTable").innerHTML = `
              
              `;

          //populate subMdoule table
          const index = allModules.findIndex((item) => item.productId == document.getElementById(`productListDropdown`).value);
          const filtered = allModules.filter((item) => item.productId == document.getElementById(`productListDropdown`).value)

          if(index >= 0) {
            filtered.forEach((item) =>{
              createModuleCard(item)
            })
          }
          else if(!(document.getElementById(`productListDropdown`).value == "0")) {
            document.getElementById("moduleEditingTable").innerHTML = `
            <tr>
              <td class="text-center" colspan="6">
               No Module Found
              </td>
            </tr>
            `
          }

          //showing all when ddl value = 0
          if(document.getElementById(`productListDropdown`).value == "0") {
            allModules.forEach((item) =>{
              createModuleCard(item)
            })
          }

        });

        // create submodule table after selection of module
        document.getElementById(`moduleListDropdown`).addEventListener("change", () => {
          // destroy the table
          document.getElementById("subModuleTable").innerHTML = `
              
              `;

          //populate subMdoule table
          const index = allModules.findIndex((item) => item._id == document.getElementById(`moduleListDropdown`).value);
          if(index >= 0) {
            var filtered = allModules[index].subModule;
            if(filtered.length > 0) {
              filtered.sort((a, b) => a.serialNumber - b.serialNumber);
              filtered.forEach((item) => {
                createSubModuleCard(item, allModules[index]._id);
              });
            }
            else {
              document.getElementById("subModuleTable").innerHTML = `
                <tr>
                  <td class="text-center" colspan="5">
                  No Sub Module Found
                  </td>
                </tr>
              `
            }
            //

          }
          else {
          
          }

        });

        // add Submodule modal functionality and saving new SubModule data to database.
        document.getElementById("openAddSubModule").addEventListener("click", () => {

          try {
            document.getElementById("inputTable").innerHTML = ""
            document.getElementById("addInputField").style.display = "none"
            document.getElementById("moduleListDropdownModal").value = document.getElementById("moduleListDropdown").value
            document.getElementById("newSubModuleTitle").value = ""

            document.getElementById("newSubModuleStatus").classList.add("active")
            document.getElementById("newSubModuleStatus").setAttribute("aria-pressed", "true")

            document.getElementById("subModuleTierListDropdownModal").value
            CKEDITOR.instances["newSubModuleDescription"].setData("");
            //document.getElementById("files").value = "";
          } catch (e) { }


          if (CKEDITOR.instances["newSubModuleDescription"]) {
            CKEDITOR.instances["newSubModuleDescription"].destroy();
          }

          CKEDITOR.replace("newSubModuleDescription");
          document.getElementById("newSubModuleTitle").value = ""

          document.getElementById("newSubModuleSubmit").innerHTML = "Submit";
          $("#modalAddSubModule").appendTo("body").modal("show");
        });
        document.getElementById("newSubModuleSubmit").addEventListener("click",(e) => {
          e.preventDefault();
          if (document.getElementById("newSubModuleSubmit").innerHTML == "Update") {
            if (mediaType == 1 || mediaType == 2) {
                  var fileArr = fileInput(mediaType).then(result => {
            var newSubModuleData = new SubModuleData();
            newSubModuleData.title = document.getElementById("newSubModuleTitle").value
            newSubModuleData.description = CKEDITOR.instances["newSubModuleDescription"].getData();
            newSubModuleData.mediaType = mediaType;
            newSubModuleData.tier = document.getElementById("subModuleTierListDropdownModal").value
            newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");
            
            var id = document.getElementById(`moduleListDropdown`).value;
            var index = allModules.findIndex((item) => item._id == id);
            var targetObj = allModules[index];
            var subId = document.getElementById("newSubModuleTitle").getAttribute("value");
            var subIndex = allModules[index].subModule.findIndex((item) => item._id == subId);
            newSubModuleData.media = result
            console.log(newSubModuleData.media)
            newSubModuleData.serialNumber = allModules[index].subModule[subIndex].serialNumber;
            targetObj.subModule.splice(subIndex, 1);
            targetObj.subModule.push(newSubModuleData);
            //console.log(newSubModuleData)
            var response = fetch(api_url + "module" + `/${id}`, {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
                "x-auth-token": api_key,
                "x-access-token": token,
              },
              body: JSON.stringify(targetObj),
            }).then(response => {
            if (response.status == 200) {
              iziToast.success({ message: 'Sub-Module Updated Successfully', position: 'bottomLeft' });
              $("#modalAddSubModule").modal("hide");
            }
            else if (response.status == 400) {
              iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
            }
            return response.json();
            }).then(data => {
              document.getElementById(`subModule_title ${subId}`).innerHTML = newSubModuleData.title;
              //document.getElementById(`subModule_description ${subId}`).getAttribute("value") = newSubModuleData.description;
              var status;
              var statusAttr;
              if (newSubModuleData.status == "true") {
                status = "Active";
                statusAttr = "badge-success";
              } else {
                status = "Inactive";
                statusAttr = "badge-danger";
              }
              document.getElementById(`subModule_status ${subId}`).innerHTML = status;
              document.getElementById(`subModule_status ${subId}`).setAttribute("class", `badge ${statusAttr}`);
            //
            allModules.splice(index, 1);
            allModules.push(data);
            
            document.getElementById("moduleListDropdown").dispatchEvent(new Event('change'))
            })
          }) 
            } 
            else if (mediaType == 3){
                var newSubModuleData = new SubModuleData();
                newSubModuleData.title = document.getElementById("newSubModuleTitle").value
                newSubModuleData.description = CKEDITOR.instances["newSubModuleDescription"].getData();
                //document.getElementById("newSubModuleDescription").value;
                newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");
                try {
                  newSubModuleData.media = document.getElementById("files-0").value
                } catch (e) {
                  
                }
                
                var id = document.getElementById(`moduleListDropdown`).value;
                var index = allModules.findIndex((item) => item._id == id);
                var targetObj = allModules[index];
                var subId = document.getElementById("newSubModuleTitle").getAttribute("value");
                var subIndex = allModules[index].subModule.findIndex((item) => item._id == subId);
                newSubModuleData.media = allModules[index].subModule[subIndex].media
                try {
                  newSubModuleData.media.concat(result)
                } catch (e) {

                }
                
                newSubModuleData.serialNumber = allModules[index].subModule[subIndex].serialNumber;
                targetObj.subModule.splice(subIndex, 1);
                targetObj.subModule.push(newSubModuleData);
                //console.log(newSubModuleData)
                var response = fetch(api_url + "module" + `/${id}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                    "x-auth-token": api_key,
                    "x-access-token": token,
                  },
                  body: JSON.stringify(targetObj),
                }).then(response => {
                if (response.status == 200) {
                  iziToast.success({ message: 'Sub-Module Updated Successfully', position: 'bottomLeft' });
                  $("#modalAddSubModule").modal("hide");
                }
                else if (response.status == 400) {
                  iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
                }
                return response.json();
                }).then(data => {
                  document.getElementById(`subModule_title ${subId}`).innerHTML = newSubModuleData.title;
                  //document.getElementById(`subModule_description ${subId}`).getAttribute("value") = newSubModuleData.description;
                  var status;
                  var statusAttr;
                  if (newSubModuleData.status == "true") {
                    status = "Active";
                    statusAttr = "badge-success";
                  } else {
                    status = "Inactive";
                    statusAttr = "badge-danger";
                  }
                  document.getElementById(`subModule_status ${subId}`).innerHTML = status;
                  document.getElementById(`subModule_status ${subId}`).setAttribute("class", `badge ${statusAttr}`);
                //
                allModules.splice(index, 1);
                allModules.push(data);
                
                document.getElementById("moduleListDropdown").dispatchEvent(new Event('change'))
                })
            }
            else if(!mediaType) {

                var newSubModuleData = new SubModuleData();
                newSubModuleData.title = document.getElementById("newSubModuleTitle").value
                newSubModuleData.description = CKEDITOR.instances["newSubModuleDescription"].getData();

                newSubModuleData.tier = document.getElementById("subModuleTierListDropdownModal").value
                newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");
                
                var id = document.getElementById(`moduleListDropdown`).value;
                var index = allModules.findIndex((item) => item._id == id);
                var targetObj = allModules[index];
                var subId = document.getElementById("newSubModuleTitle").getAttribute("value");
                var subIndex = allModules[index].subModule.findIndex((item) => item._id == subId);
                
                newSubModuleData.serialNumber = allModules[index].subModule[subIndex].serialNumber;
                targetObj.subModule.splice(subIndex, 1);
                targetObj.subModule.push(newSubModuleData);
                //console.log(newSubModuleData)
                var response = fetch(api_url + "module" + `/${id}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                    "x-auth-token": api_key,
                    "x-access-token": token,
                  },
                  body: JSON.stringify(targetObj),
                }).then(response => {
                if (response.status == 200) {
                  iziToast.success({ message: 'Sub-Module Updated Successfully', position: 'bottomLeft' });
                  $("#modalAddSubModule").modal("hide");
                }
                else if (response.status == 400) {
                  iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
                }
                return response.json();
                }).then(data => {
                  document.getElementById(`subModule_title ${subId}`).innerHTML = newSubModuleData.title;
                  //document.getElementById(`subModule_description ${subId}`).getAttribute("value") = newSubModuleData.description;
                  var status;
                  var statusAttr;
                  if (newSubModuleData.status == "true") {
                    status = "Active";
                    statusAttr = "badge-success";
                  } else {
                    status = "Inactive";
                    statusAttr = "badge-danger";
                  }
                  document.getElementById(`subModule_status ${subId}`).innerHTML = status;
                  document.getElementById(`subModule_status ${subId}`).setAttribute("class", `badge ${statusAttr}`);
                //
                allModules.splice(index, 1);
                allModules.push(data);
                
                document.getElementById("moduleListDropdown").dispatchEvent(new Event('change'))
                })
            }


          }

          if (document.getElementById("newSubModuleSubmit").innerHTML == "Submit") {
            if (mediaType == 1 || mediaType == 2) {
                    var fileArr = fileInput(mediaType).then(result => {
              var newSubModuleData = new SubModuleData();
            newSubModuleData.title = document.getElementById("newSubModuleTitle").value;
            newSubModuleData.description = CKEDITOR.instances["newSubModuleDescription"].getData();
            newSubModuleData.mediaType = mediaType;
            newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");
            newSubModuleData.tier = document.getElementById("subModuleTierListDropdownModal").value
            newSubModuleData.media = result

              var id = document.getElementById(`moduleListDropdownModal`).value;
              var index = allModules.findIndex((item) => item._id == id);
        
              if (index >= 0 ) {
                var targetObj = allModules[index];
                newSubModuleData.serialNumber = targetObj.subModule.length + 1;
                targetObj.subModule.push({...newSubModuleData});
                var response = fetch(api_url + "module" + `/${id}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                    "x-auth-token": api_key,
                    "x-access-token": token,
                  },
                  body: JSON.stringify(targetObj),
                }).then(response => {
                  if (response.status == 200) {
                  iziToast.success({ message: "Sub-Module Added Successfully", position: 'bottomLeft' });
                  $("#modalAddSubModule").modal("hide");
        
                }
                else if (response.status == 400) {
                  iziToast.error({ message: "Exception Occured", position: 'bottomLeft' });
                }
                return response.json()
                }).then(data => {
                  //console.log(data)
                var ind = data.subModule.length;
                allModules.splice(index, 1);
                allModules.push(data);
                document.getElementById("moduleListDropdown").value = document.getElementById("moduleListDropdownModal").value;
                document.getElementById("moduleListDropdown").dispatchEvent(new Event('change'))
                })
              }
              else {
                iziToast.error({ message: "Please Select a Module", position: 'bottomLeft' });
              }
            })
            }
            else if (mediaType == 3){

              var newSubModuleData = new SubModuleData();
              newSubModuleData.title = document.getElementById("newSubModuleTitle").value;
              newSubModuleData.description = CKEDITOR.instances["newSubModuleDescription"].getData();
              newSubModuleData.mediaType = mediaType;
              newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");
              newSubModuleData.media = {
                link: document.getElementById("files-0").value,
                caption: document.getElementById("caption-0").value
              }
      
              var id = document.getElementById(`moduleListDropdownModal`).value;
              var index = allModules.findIndex((item) => item._id == id);
        
              if (index >= 0 ) {
                var targetObj = allModules[index];
                newSubModuleData.serialNumber = targetObj.subModule.length + 1;
                targetObj.subModule.push({...newSubModuleData});
                var response = fetch(api_url + "module" + `/${id}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                    "x-auth-token": api_key,
                    "x-access-token": token,
                  },
                  body: JSON.stringify(targetObj),
                }).then(response => {
                  if (response.status == 200) {
                  iziToast.success({ message: "Sub-Module Added Successfully", position: 'bottomLeft' });
                  $("#modalAddSubModule").modal("hide");
        
                }
                else if (response.status == 400) {
                  iziToast.error({ message: "Exception Occured", position: 'bottomLeft' });
                }
                return response.json()
                }).then(data => {
                  //console.log(data)
                var ind = data.subModule.length;
                allModules.splice(index, 1);
                allModules.push(data);
                document.getElementById("moduleListDropdown").value = document.getElementById("moduleListDropdownModal").value;
                document.getElementById("moduleListDropdown").dispatchEvent(new Event('change'))
                })
              }
              else {
                iziToast.error({ message: "Please Select a Module", position: 'bottomLeft' });
              }
            }
            else if(!mediaType){

              var newSubModuleData = new SubModuleData();
              newSubModuleData.title = document.getElementById("newSubModuleTitle").value;
              newSubModuleData.description = CKEDITOR.instances["newSubModuleDescription"].getData();
              newSubModuleData.mediaType = mediaType;
              newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");

      
              var id = document.getElementById(`moduleListDropdownModal`).value;
              var index = allModules.findIndex((item) => item._id == id);
        
              if (index >= 0 ) {
                var targetObj = allModules[index];
                newSubModuleData.serialNumber = targetObj.subModule.length + 1;
                targetObj.subModule.push({...newSubModuleData});
                var response = fetch(api_url + "module" + `/${id}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                    "x-auth-token": api_key,
                    "x-access-token": token,
                  },
                  body: JSON.stringify(targetObj),
                }).then(response => {
                  if (response.status == 200) {
                  iziToast.success({ message: "Sub-Module Added Successfully", position: 'bottomLeft' });
                  $("#modalAddSubModule").modal("hide");
        
                }
                else if (response.status == 400) {
                  iziToast.error({ message: "Exception Occured", position: 'bottomLeft' });
                }
                return response.json()
                }).then(data => {
                  //console.log(data)
                var ind = data.subModule.length;
                allModules.splice(index, 1);
                allModules.push(data);
                document.getElementById("moduleListDropdown").value = document.getElementById("moduleListDropdownModal").value;
                document.getElementById("moduleListDropdown").dispatchEvent(new Event('change'))
                })
              }
              else {
                iziToast.error({ message: "Please Select a Module", position: 'bottomLeft' });
              }
            }

          }

        });

        // populate tiers in dropdowns
        allTiers.forEach(tier => {

        var option = document.createElement("option");
        option.setAttribute("value", tier._id);
        option.setAttribute("id", `tierListDropdownOption${tier._id}`);
        option.innerHTML = tier.title;
        document.getElementById("moduleTierListDropdownModal").appendChild(option);

        var option = document.createElement("option");
        option.setAttribute("value", tier._id);
        option.setAttribute("id", `tierListDropdownOption${tier._id}`);
        option.innerHTML = tier.title;
        document.getElementById("subModuleTierListDropdownModal").appendChild(option);
        })
        console.log(allProducts, allModules)

  }

  // Initialize dragula for module table, subModule table and Images in edit submodule Modal
  function initDragula() {

  // DRAGULA FOR PRODUCTS 
  dragula([document.getElementById("productEditingTable")]).on(
    "drop",
    async function (el) {
      var flag = 0;
      var newSortOrder = [];
      document
        .getElementById("productEditingTable")
        .childNodes.forEach((element) => {
          if (flag == 1) {
            newSortOrder.push(
              element.childNodes[3].getAttribute("value").toString()
            );
          }
          flag = 1;
        });
      var myObj = {
        title: "serial Order",
        demonstratorEmail: newSortOrder,
      };

      var response = await fetch(
        api_url + "product/" + sortProductOrderId,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-auth-token": api_key,
            "x-access-token": token,
          },
          body: JSON.stringify(myObj),
        }
      );
      var data = await response.json();
    }
  );
  //dragula for dragabble cards
  dragula([document.getElementById("moduleEditingTable")]).on(
    "drop",
    async function (el) {
      var flag = 0;
      var newSortOrder = [];
      document
        .getElementById("moduleEditingTable")
        .childNodes.forEach((element) => {
          if (flag == 1) {
            newSortOrder.push(
              element.childNodes[3].getAttribute("value").toString()
            );
          }
          flag = 1;
        });
      var myObj = {
        title: "serial Order",
        demonstratorEmail: newSortOrder,
      };

      var response = await fetch(
        api_url + "module/" + sortOrderId,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-auth-token": api_key,
            "x-access-token": token,
          },
          body: JSON.stringify(myObj),
        }
      );
      var data = await response.json();
    }
  );
  dragula([document.getElementById("subModuleTable")]).on("drop",async function (el) {
      var i = 0;
      var flag = 0;
      var index;
      var moduleId;
      document.getElementById("subModuleTable").childNodes.forEach((element) => {
          if (flag == 1) {
            element.setAttribute("data-value", i + 1);
            moduleId = element.getAttribute("value");
            var subModuleId = element.childNodes[5].getAttribute("id").split(" ")[1];

            index = allModules.findIndex((item) => item._id == moduleId);
            var subIndex = allModules[index].subModule.findIndex((item) => item._id == subModuleId);
            allModules[index].subModule[subIndex].serialNumber = i + 1;
            i++;
          }
          flag = 1;
        });
      var response = await fetch(api_url + "module/" + moduleId, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-auth-token": api_key,
          "x-access-token": token,
        },
        body: JSON.stringify(allModules[index]),
      });
      var data = await response.json();
    }
  );
  // for images
  dragula([document.getElementById("inputTable")]).on("drop",async function (el) {
    var i = 0;
    var flag = 0;
    var moduleId = document.getElementById("inputTable").getAttribute("data-moduleid")
    var subModuleId = document.getElementById("inputTable").getAttribute("data-subModuleid")
    var index = allModules.findIndex(obj => obj._id == moduleId)
    var subIndex = allModules[index].subModule.findIndex(obj => obj._id == subModuleId)
    var subModule = allModules[index].subModule[subIndex]
    subModule.media = [];
    var table = document.getElementById("inputTable")
    table.childNodes.forEach((element) => {
          var img = (element.childNodes[3].childNodes[1]);
          var caption = (element.childNodes[5].childNodes[1]);
          // console.log(caption.getAttribute("value"))
          // console.log(img.getAttribute("src"))
          //console.log(table.getElementById(`mediaDisplay-${i}`))
          var myObj = {
            link : img.getAttribute("src"),
            caption : caption.getAttribute("value")
          }
          subModule.media.push(myObj)

      });
    var response = await fetch(api_url + "module/" + moduleId, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
        "x-access-token": token,
      },
      body: JSON.stringify(allModules[index]),
    });
    
    var data = await response.json();

  }
  );

  }

  // file input function: take file input , saves to azure and returns urls to access the file.
  function fileInput(mediaType) {
    var fileArr = [];
    var promises = [];
    document.getElementById("inputTable").querySelectorAll("tr").forEach((element) => {
      console.log(element)
      var fileId = element.firstElementChild.firstElementChild.getAttribute("id")
      //var caption = element.lastElementChild.previousElementSibling.firstElementChild.value //caption-1
      var i = fileId.split("-")[1]
      var caption = element.lastElementChild.previousElementSibling.previousElementSibling.firstElementChild.value;
      var tier = element.lastElementChild.previousElementSibling.firstElementChild.value
      console.log(caption)
      const formData = new FormData();
      var fileLink = [];

      try {
    var file = document.getElementById(`files-${i}`);

    for (var myFile of file.files) {
      formData.append("files", myFile);
    }

    var promise =  fetch(api_url + "upload", {
      method: "POST",
      headers: {
        "x-auth-token": api_key,
        "x-access-token": token,
      },
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      fileLink.push(data[0])
    // if (response.status == 200 && fileLink.length > 0) {
    //   iziToast.success({ message: "File Uploaded Successfully", position: 'bottomLeft' });
    // }
    // else if (response.status == 400) {
    //   iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
    // }
    var myObj = {
      tier: tier,
      caption: caption,
      link: fileLink[0]
    }
    console.log(myObj)
    fileArr.push(myObj); 
    })
    
    promises.push(promise)
    //saveSubModule(fileArr)
      }catch (e) {
        console.log("Error saving")
        if(mediaType == 1) {
          fileLink.push(element.querySelector('img').getAttribute("src"))
        }
        else if(mediaType == 2) {
          fileLink.push(element.querySelector('video').getAttribute("src"))
        }

        caption = element.querySelector('input').value
        //console.log(fileLink[0])
        var myObj = {
          tier: tier,
          caption: caption,
          link: fileLink[0]
        }
        console.log(myObj)
        fileArr.push(myObj); 
      }
      //console.log(fileLink)

    
  })

  return Promise.all(promises).then(() => {
    console.log(fileArr)
    return fileArr
  })

  }

  //logout
  document.getElementById("logout").addEventListener("click", function () {
    Swal.fire({
      title: 'LogOut',
      text: 'Are you sure, you want to logout?',
      icon: 'warning',
      confirmButtonText: 'Confirm Logout',
      confirmButtonColor: "red",
      showCancelButton: true
    }).then((result) => {
      // Read more about isConfirmed, isDenied below /
      if (result.isConfirmed) {
        localStorage.removeItem("msExpToken")
        window.location.href = "./SignIn.html";
      }
    })
    
  })
});
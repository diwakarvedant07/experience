document.addEventListener("DOMContentLoaded", async function () {
  var token;
  var allModules;
  var API_URL = "http://172.16.6.153:3000/"
  var api_key = "8779bad8-4022-11ee-be56-0242ac120002";
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
  token = getCookie(msToken);
  function ModuleData(title, description, status, icon, demonstratorEmail, subModules) {
    this.title = title;
    this.description = description;
    this.status = status;
    this.icon = icon;
    this.demonstratorEmail = demonstratorEmail;
    this.subModules = subModules;
  }
  function SubModuleData(title, status, description, media) {
    this.title = title
    this.description = description
    this.status = status
    this.medial = media
  }
  //create module card function
  function createModuleCard(module) {
    var status;
    var statusAttr;
    if (module.status == true) {
      status = "Active";
      statusAttr = "badge-success"
    }
    else {
      status = "Inactive";
      statusAttr = "badge-danger"
    }
    //create module cards for the editing table
    var tbody = document.createElement('tr');
    tbody.innerHTML = `
		<td><button type="button" class="btn btn-primary btn-outline py-1 px-2" id=""><i class="bi bi-arrows-move"></i></button></td>
		<td><button type="button" class="btn btn-primary btn-outline py-1 px-2" id="moduleCard ${module._id}"><i class="bi bi-pencil"></i></button></td>
		<td id="module_title ${module._id}">${module.title}</td>
		<td>
			<div class="d-inline-flex justify-content-center align-items-center bg-primary px-3 py-2 rounded-1">
            <i class="${module.icon}" id="module_icon ${module._id}"></i>
			</div>
		</td>
	    <td><span class="badge ${statusAttr}" id="module_status ${module._id}" style="cursor: pointer;">${status}</span></td>
    `
    var toggleBadge = tbody.querySelector(`[id="module_status ${module._id}"]`);
    toggleBadge.addEventListener('click', function () {
      if (toggleBadge.classList.contains('badge-success')) {
        toggleBadge.className = "badge badge-danger";
        toggleBadge.innerHTML = "Inactive";
      }
      else if (toggleBadge.classList.contains('badge-danger')) {
        toggleBadge.className = "badge badge-success";
        toggleBadge.innerHTML = "Active";
      }
    })
    document.getElementById("moduleEditingTable").appendChild(tbody);

    //adding event listeners on the edit icon of each module card
    document.getElementById(`moduleCard ${module._id}`).addEventListener("click", () => {
      $("#modalAddModule").appendTo("body").modal("show");
      document.getElementById("newModuleTitle").value = module.title;
      document.getElementById("newModuleTitle").setAttribute("value", module._id);
      document.getElementById("newModuleDescription").value = module.description;
      document.getElementById("newModuleStatus").setAttribute("aria-pressed", module.status);
      if (module.status == true) {
        document.getElementById("newModuleStatus").classList.add("active");
      }
      document.getElementById("newModuleIcon").value = module.icon;
      document.getElementById("newModuleSubmit").innerHTML = "Update"
    })

    // create li element for the list in the submodule section.
    var option = document.createElement("option");
    option.setAttribute("value", module._id)
    option.setAttribute("id", `moduleListDropdownOption${module._id}`)
    option.innerHTML = module.title
    document.getElementById("moduleListDropdown").appendChild(option);
  }

  // create subModule card function
  function createSubModuleCard(item) {
    var status;
    var statusAttr
    var tbody = document.createElement('tbody');
    if (item.status == true) {
      status = "Active";
      statusAttr = "badge-success"
    }
    else {
      status = "Inactive";
      statusAttr = "badge-danger"
    }
    tbody.setAttribute('class', "bt-3 border-primary")
    tbody.innerHTML = `
            <tr>
            <td>
              <button type="button" class="btn btn-primary btn-outline py-1 px-2 ms-2" id=""><i class="bi bi-arrows-move"></i></button>
            </td>
				<td>
					<div class="d-flex">
						<button type="button" class="btn btn-primary btn-outline py-1 px-2" data-bs-target="#modalAddSubModule" data-bs-toggle="modal" id="subModuleCard ${item._id}"><i class="bi bi-pencil"></i></button>
						<button type="button" class="btn btn-primary btn-outline py-1 px-2 ms-2" id="viewSubModuleCard ${item._id}"><i class="bi bi-eye"></i></button>
					</div>
				</td>
				<td id="subModule_title ${item._id}">${item.title}</td>
				<td><span id="subModule_status ${item._id}" class="badge ${statusAttr}">${status}</span></td>
                
			</tr>
            `
    document.getElementById("subModuleTable").appendChild(tbody)
    //adding event listeners on the edit icon of each SubModule card
    document.getElementById(`subModuleCard ${item._id}`).addEventListener("click", () => {
      $("#modalAddSubModule").appendTo("body").modal("show");
      document.getElementById("newSubModuleTitle").value = item.title;
      document.getElementById("newSubModuleTitle").setAttribute("value", item._id);
      document.getElementById("newSubModuleDescription").value = item.description;
      document.getElementById("newSubModuleStatus").setAttribute("aria-pressed", item.status);
      if (item.status == true) {
        document.getElementById("newSubModuleStatus").classList.add("active");
      }
      // document.getElementById("newModuleIcon").value = module.icon;
      document.getElementById("newSubModuleSubmit").innerHTML = "Update"
    })

    document.getElementById(`viewSubModuleCard ${item._id}`).addEventListener("click", () => {
      $("#modalSMView").appendTo("body").modal("show");
      document.getElementById("viewSubModuleTitle").innerHTML = item.title;
      document.getElementById("viewSubModuleDescription").innerHTML = item.description;
      document.getElementById("viewSubModuleStatus").setAttribute("aria-pressed", item.status);
      if (item.status == true) {

        document.getElementById("viewSubModuleStatus").innerHTML = "Active";
        document.getElementById("viewSubModuleStatus").setAttribute("class", "badge badge-success");
        document.getElementById("viewSubModuleStatus").classList.add("active");
      }
      else {
        document.getElementById("viewSubModuleStatus").innerHTML = "Inactive";
        document.getElementById("viewSubModuleStatus").setAttribute("class", "badge badge-danger");
        document.getElementById("viewSubModuleStatus").classList.remove("active");
      }
      // giving media source
      document.getElementById("player1").setAttribute("poster", item.media[0])
    })
  }

  //file input function: take file input , saves to azure and returns urls to access the file.
  async function fileInput() {
    var file = document.getElementById("files");
    const formData = new FormData();
    var fileLink;

    for (var myFile of file.files) {
      formData.append("files", myFile);
    }

    await fetch(API_URL + "upload", {
      method: "POST",
      headers: {
        "x-auth-token": api_key,
        "x-access-token": token,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((responseData) => {
        fileLink = responseData;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    return fileLink
  }

  //fetch all modules.

  async function fetchModules() {
    var response = await fetch(API_URL + "module", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
        "x-access-token": token,
      },
    })
    var data = await response.json()
    allModules = data;

  }
  await fetchModules()

  // populating module data on module table and dropdowns 
  allModules.forEach((module) => {
    createModuleCard(module);
  })

  // add module modal functionality and saving new module data to database.
  document.getElementById("openAddModule").addEventListener("click", () => {
    console.log("openAddModule")
    document.getElementById("newModuleSubmit").innerHTML = "Submit"
    $("#modalAddModule").appendTo("body").modal("show");
  })
  document.getElementById("newModuleSubmit").addEventListener("click", async () => {
    if (document.getElementById("newModuleSubmit").innerHTML == "Submit") {
      newModuleData = new ModuleData;
      newModuleData.title = document.getElementById("newModuleTitle").value;
      newModuleData.description = document.getElementById("newModuleDescription").value;
      newModuleData.status = document.getElementById("newModuleStatus").getAttribute("aria-pressed");
      newModuleData.icon = document.getElementById("newModuleIcon").value;

      var response = await fetch(API_URL + "module", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-auth-token": api_key,
          "x-access-token": token,
        },
        body: JSON.stringify(newModuleData),
      })
      var data = await response.json()
      console.log(data)
      createModuleCard(newModuleData);
      allModules.push(newModuleData);
    }

    if (document.getElementById("newModuleSubmit").innerHTML == "Update") {
      newModuleData = new ModuleData;
      newModuleData.title = document.getElementById("newModuleTitle").value;
      newModuleData.description = document.getElementById("newModuleDescription").value;
      newModuleData.status = document.getElementById("newModuleStatus").getAttribute("aria-pressed");
      newModuleData.icon = document.getElementById("newModuleIcon").value;
      var id = document.getElementById("newModuleTitle").getAttribute("value")
      var response = await fetch(API_URL + "module" + `/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-auth-token": api_key,
          "x-access-token": token,
        },
        body: JSON.stringify(newModuleData),
      })
      var data = await response.json()
      console.log(data);
      document.getElementById(`module_title ${id}`).innerHTML = newModuleData.title;
      document.getElementById(`module_description ${id}`).innerHTML = newModuleData.description;
      var status;
      var statusAttr;
      if (newModuleData.status == "true") {
        status = "Active";
        statusAttr = "badge-success"
      }
      else {
        status = "Inactive";
        statusAttr = "badge-danger"
      }
      document.getElementById(`module_status ${id}`).innerHTML = status;
      document.getElementById(`module_status ${id}`).setAttribute("class", `badge ${statusAttr}`);
    }
    const index = allModules.findIndex(item => item._id === id);
    allModules.splice(index, 1);
    allModules.push(data)
    console.log(allModules)

  })

  // create submodule table after selection of module
  document.getElementById(`moduleListDropdown`).addEventListener("change", () => {
    // destroy the table
    document.getElementById("subModuleTable").innerHTML = `
        <thead>
			<tr>
				<th>Move</th>
				<th>Action</th>
				<th>Sub Module</th>
				<th>Status</th>
			</tr>
		</thead>
        `

    //populate subMdoule table
    const index = allModules.findIndex(item => item._id === document.getElementById(`moduleListDropdown`).value);
    allModules[index].subModule.forEach((item) => {
      createSubModuleCard(item);
    })
  })

  // add Submodule modal functionality and saving new SubModule data to database.
  document.getElementById("openAddSubModule").addEventListener("click", () => {
    console.log("openAddSubModule")
    document.getElementById("newSubModuleSubmit").innerHTML = "Submit"
    $("#modalAddSubModule").appendTo("body").modal("show");
  })
  document.getElementById("newSubModuleSubmit").addEventListener("click", async () => {
    if (document.getElementById("newSubModuleSubmit").innerHTML == "Submit") {
      newSubModuleData = new SubModuleData;
      newSubModuleData.title = document.getElementById("newSubModuleTitle").value;
      newSubModuleData.description = document.getElementById("newSubModuleDescription").value;
      newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");
      newSubModuleData.media = await fileInput();
      var id = document.getElementById(`moduleListDropdown`).value
      var index = allModules.findIndex(item => item._id == id)
      var targetObj = allModules[index];
      targetObj.subModule.push(newSubModuleData);
      var response = await fetch(API_URL + "module" + `/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-auth-token": api_key,
          "x-access-token": token,
        },
        body: JSON.stringify(targetObj),
      })
      var data = await response.json()
      console.log(data)
      var ind = data.subModule.length
      createSubModuleCard(data.subModule[ind - 1]);
      allModules.splice(index, 1)
      allModules.push(data);
    }

    if (document.getElementById("newSubModuleSubmit").innerHTML == "Update") {
      newSubModuleData = new SubModuleData;
      newSubModuleData.title = document.getElementById("newSubModuleTitle").value;
      newSubModuleData.description = document.getElementById("newSubModuleDescription").value;
      newSubModuleData.status = document.getElementById("newSubModuleStatus").getAttribute("aria-pressed");
      newSubModuleData.media = await fileInput();
      var id = document.getElementById(`moduleListDropdown`).value
      var index = allModules.findIndex(item => item._id == id)
      var targetObj = allModules[index];
      var subId = document.getElementById("newSubModuleTitle").getAttribute("value");
      var subIndex = allModules[index].subModule.findIndex(item => item._id == subId)
      targetObj.subModule.splice(subIndex, 1)
      targetObj.subModule.push(newSubModuleData);
      var response = await fetch(API_URL + "module" + `/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-auth-token": api_key,
          "x-access-token": token,
        },
        body: JSON.stringify(targetObj),
      })
      var data = await response.json()
      console.log(data);
      document.getElementById(`subModule_title ${subId}`).innerHTML = newSubModuleData.title;
      //document.getElementById(`subModule_description ${subId}`).getAttribute("value") = newSubModuleData.description;
      var status;
      var statusAttr;
      if (newSubModuleData.status == "true") {
        status = "Active";
        statusAttr = "badge-success"
      }
      else {
        status = "Inactive";
        statusAttr = "badge-danger"
      }
      document.getElementById(`subModule_status ${subId}`).innerHTML = status;
      document.getElementById(`subModule_status ${subId}`).setAttribute("class", `badge ${statusAttr}`);
    }
    allModules.splice(index, 1);
    allModules.push(data)
    console.log(allModules)

  })
})


// Media type change
$("#configfileVideo").hide();
document.querySelector('#ddlMediaType').addEventListener('change', function () {
  if ($('#ddlMediaType').val() == 1) {
    $("#configfileImage").show();
    $("#configfileVideo").hide();
  }
  else if ($('#ddlMediaType').val() == 2) {
    $("#configfileImage").hide();
    $("#configfileVideo").show();
  }

})
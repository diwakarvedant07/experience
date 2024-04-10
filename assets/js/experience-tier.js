document.addEventListener("DOMContentLoaded",async function() {
    ////// declarations

    //var api_url = "http://127.0.0.1:5605/"
    var api_url = "https://api.mastersofterp.in/MSEXP/";
    var api_key = "8779bad8-4022-11ee-be56-0242ac120002";
    var allTiers;
    var token;
    var user;
    

    //constructors for Tier data
    function TierData(title,icon,color,parent,status) {
        this.title = title; 
        this.icon = icon;
        this.color = color;
        this.parent = parent;
        this.status = status;
    }

    ////// main flow

    try {
        token = getCookie("msToken")
        await verifyToken("msToken")
        document.getElementById('username').innerHTML = user.fullName;

        // check admin access
        // if (user.userType != -1) {
        //     window.location.href = "./Modules.html";
        // }
    
        //get data
        await fetchTiers();

        //fill table
        await populateTable()
    
    } catch (e) {
        console.log(e)
    }

    //////functions 

    //Create tier card function

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
        //console.log(allTiers);
    }

    function populateTable(){
        allTiers.forEach(tier => {
            //console.log(tier)
            createTierCard(tier)
        })
    }

    async function createTierCard(tier) {
        var status;
        var statusAttr;

        if (tier.status == true) {
        status = "Active";
        statusAttr = "badge-success";
        
        } else {
        status = "Inactive";
        statusAttr = "badge-danger";
        }
        //create tier cards for the editing table
        var tbody = document.createElement("tr");
        tbody.innerHTML = `

        <td value = ${tier.serialNumber}>
            <button type="button" class="btn btn-primary btn-outline py-1 px-2" id="tierCard ${tier._id}">
                <i class="bi bi-pencil"></i>
            </button>
        </td>
        <td id="tier_title ${tier._id}">${tier.title}</td>
        <td>${tier.color}</td>
        <td>
        <div class="d-inline-flex justify-content-center align-items-center bg-primary px-3 py-2 rounded-1">
                <i class="${tier.icon}" id="tier_icon ${tier._id}"></i>
        </div>
        </td>
        <td>
            <span class="badge ${statusAttr}" id="tier_status ${tier._id}">${status}</span>
        </td>
        `;
        document.getElementById("tierEditingTable").appendChild(tbody);
        //adding event listeners on the edit icon of each tier card
        document.getElementById(`tierCard ${tier._id}`).addEventListener("click", () => {
            var index = allTiers.findIndex((item) => item._id === tier._id);

            $("#modalAddTier").appendTo("body").modal("show");
            document.getElementById("newTierTitle").value = allTiers[index].title;
            document.getElementById("newTierTitle").setAttribute("value", allTiers[index]._id);
            document.getElementById(`newTierStatus`).setAttribute("aria-pressed", allTiers[index].status);
            document.getElementById(`newTierColor`).innerHTML =  allTiers[index].color
            document.getElementById(`newTierIcon`).innerHTML =  allTiers[index].icon
            document.getElementById(`tierListDropdown`).value = allTiers[index].parent

            
            if (allTiers[index].status == true) {
            document.getElementById(`newTierStatus`).classList.add("active");
            }
            else if (allTiers[index].status == false) {
            document.getElementById(`newTierStatus`).classList.remove("active");
            }
            document.getElementById("newTierIcon").value = allTiers[index].icon;
            document.getElementById("newTierSubmit").innerHTML = "Update";
        });

        var toggleBadge = tbody.querySelector(`[id="tier_status ${tier._id}"]`);
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
        var index = allTiers.findIndex(item => item._id == tier._id)
        allTiers[index].status = T;
        var response = await fetch(
            api_url + "tier/" + tier._id,
            {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
                "x-auth-token": api_key,
                "x-access-token": token,
            },
            body: JSON.stringify(allTiers[index]),
            }
        );
        if (response.status == 200) {
            iziToast.success({ message: `${allTiers[index].title} Tier is ${toggleBadge.innerHTML}`, position: 'bottomLeft' });
        }
        else if (response.status == 400) {
            iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
        }

        var data = await response.json();
        });

        // create li element for the list in the subtier section.
        var option = document.createElement("option");
        option.setAttribute("value", tier._id);
        option.setAttribute("id", `tierListDropdownOption${tier._id}`);
        option.innerHTML = tier.title;
        document.getElementById("tierListDropdown").appendChild(option);
    } 

    //Add tier modal functionality and saving new tier data to database.
    document.getElementById("openAddTier").addEventListener("click", () => {
        //clearing the modal form
        document.getElementById("newTierTitle").value = ""
        try {
        document.getElementById("productListDropdownModal").value = document.getElementById("productListDropdown").value
        } catch (e) {
            console.log(e)
        }

        document.getElementById("newTierIcon").value = ""

        document.getElementById("newTierSubmit").innerHTML = "Submit";
        $("#modalAddTier").appendTo("body").modal("show");
    });
    document.getElementById("newTierSubmit").addEventListener("click", async () => {
        //new tier
        if (document.getElementById("newTierSubmit").innerHTML == "Submit") {
        newTierData = new TierData();
        newTierData.title = document.getElementById("newTierTitle").value;
        newTierData.parent = document.getElementById("tierListDropdown").value
        newTierData.color = document.getElementById("newTierColor").value
        newTierData.status = document
            .getElementById("newTierStatus")
            .getAttribute("aria-pressed");
        newTierData.icon = document.getElementById("newTierIcon").value;

        // var serialNumber = sortOrder.length
        // newTierData.serialNumber = serialNumber + 1
        // sortOrder.push(`${serialNumber + 1}`)

        var response = await fetch(api_url + "tier", {
            method: "POST",
            headers: {
            "content-type": "application/json",
            "x-auth-token": api_key,
            "x-access-token": token,
            },
            body: JSON.stringify(newTierData),
        });
        if (response.status == 201) {
            iziToast.success({ message: 'Tier Added Successfully' });
            $("#modalAddSubTier").modal("hide");
        }
        else if (response.status == 400) {
            iziToast.error({ message: 'Exception Occured' });
        }
        var data = await response.json();
        

        createTierCard(data);
        allTiers.push(data);
        }
        //update the tier
        if (document.getElementById("newTierSubmit").innerHTML == "Update") {
        var newTierData = new TierData();
        newTierData.title = document.getElementById("newTierTitle").value;
        newTierData.parent = document.getElementById("tierListDropdown").value
        newTierData.status = document.getElementById("newTierStatus").getAttribute("aria-pressed");
        newTierData.color = document.getElementById("newTierColor").value
        newTierData.icon = document.getElementById("newTierIcon").value;
        var id = document.getElementById("newTierTitle").getAttribute("value");
        var response = await fetch(api_url + "tier" + `/${id}`, {
            method: "PATCH",
            headers: {
            "content-type": "application/json",
            "x-auth-token": api_key,
            "x-access-token": token,
            },
            body: JSON.stringify(newTierData),
        });
        if (response.status == 200) {
            iziToast.success({ message: "Tier Updated Successfully", position: 'bottomLeft' });
            $("#modalAddTier").modal("hide");
        }
        else if (response.status == 400) {
            iziToast.error({ message: "Update Failed", position: 'bottomLeft' });
        }
        var data = await response.json();
        document.getElementById(`tier_title ${id}`).innerHTML = newTierData.title;

        var status;
        var statusAttr;
        if (newTierData.status == "true") {
            status = "Active";
            statusAttr = "badge-success";
        } else {
            status = "Inactive";
            statusAttr = "badge-danger";
        }
        document.getElementById(`tier_status ${id}`).innerHTML = status;
        document.getElementById(`tier_status ${id}`).setAttribute("class", `badge ${statusAttr}`);
        document.getElementById(`tier_icon ${id}`).className = data.icon;

        //making changes locally
        const index = allTiers.findIndex((item) => item._id == id);
        allTiers.splice(index, 1);
        allTiers.push(data);
        }
    });

    // dragula
    function initDragula() {
        //dragula for dragabble cards
        dragula([document.getElementById("tierEditingTable")]).on(
            "drop",
            async function (el) {
            var flag = 0;
            var newSortOrder = [];
            document
                .getElementById("tierEditingTable")
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
                api_url + "tier/" + sortOrderId,
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
    }



    // verify validity of token
    async function verifyToken(name) {
        token = await getCookie("msToken") 
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
        }

        else if (response.status == 403) {
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
})
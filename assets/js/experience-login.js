const api_key = "8779bad8-4022-11ee-be56-0242ac120002";

document.addEventListener("DOMContentLoaded", async function () {
 
  var api_url = "http://127.0.0.1:5605/"
  var token;
  //check if token exists in cookies ********************************
  // set cookie function
  function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
  }

  // get cookie function
  function getCookie(name) {
    let myvar = document.cookie
    myvar.split(";").forEach(cookie => {
      if (cookie.split("=")[0] == name) {
        token = cookie.split("=")[1];
      }
    })
    return token;
  }

  // delete cookie function
  function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }

  //verify the token inside cookie inside token; if token verified send to Modules.js else continue with login.
  function verifyToken(token) {
    token = getCookie(token);
    if (token) {
      fetch(api_url + "verifyToken", {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "x-auth-token": api_key,
          "x-access-token": token,
        },
      })
        .then((response) => {
          console.log(response.status)
          if (response.status == 200) {
            window.location.href = "./Modules.html";
          }
          else if (response.status == 403) {
            // 403 means token is invalid.
            deleteCookie("msToken");
          }
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
        });
    }
  }


  function RegisterForm(fullName, emailId, orgName) {
    this.fullName = fullName;
    this.emailId = emailId;
    this.orgName = orgName;
  }
  function LoginForm(loginEmailId, password) {
    this.loginEmailId = loginEmailId;
    this.password = password;
  }

  //open register page 

  function register() {
    var registerForm = new RegisterForm();
    //open modal ********************************
    //adding event listener to the submit button
    registerForm.fullName = document.getElementById("fullName").value;
    registerForm.emailId = document.getElementById("emailId").value;
    registerForm.orgName = document.getElementById("orgName").value;
    //close modal ********************************

    //saving data to database
    fetch(api_url + "register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
      },
      body: JSON.stringify(registerForm),
    })
      .then((response) => {
        console.log(response.status)
        if (response.status == 201) {
          document.getElementById("formContent").innerHTML = `
          <div class="text-center">
          <h4>An OTP has been sent to your Email ID: <br><span class="text-warning">${registerForm.emailId}</span></h4>
          <h4>Please use it to Login</h4>
          <div class="row">
            <div class="col-12 d-flex justify-content-center">
              <a href="./SignUp.html" class=" me-2">
                <button type="button" class="btn btn-info w-p100">Register with a different Email ID</button>
              </a>
              <a href="./SignIn.html">
                <button type="button" class="btn btn-info w-p100">Sign In</button>
              </a>
            </div>
          </div>
        </div>
            `
            //window.location.href = "/experience-front/experience-front/Experience/SignIn.html";
          }
          else if (response.status == 400) {
            iziToast.error({ message: 'Email ID already in use' , position: 'bottomCenter' });
          }
        })
      .catch((error) => {
        console.error("Error adding todo:", error);
      });
  }

  $("#registerButton").on("click", function () {
    verifyToken();
    register();
  });

  ////////open login page 

  async function login() {
    var loginForm = new LoginForm();
    //trigger the login function
    //get emailId
    loginForm.loginEmailId = document.getElementById("loginEmailId").value;
    //get password
    loginForm.password = document.getElementById("password").value;
    //send the email and password to the server
    var response = await fetch(api_url + "login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
      },
      body: JSON.stringify(loginForm),
    })

    var data = await response.json();
    token = data.resp;
    setCookie("msToken", token, 1)

    if (response.status == 202) {
      window.location.href = "./ModuleSetup.html";
    }
    else if (response.status == 200) {
      window.location.href = "./Products.html";
    }
    else if (response.status == 401) {
      // iziToast.error({
      //   title: 'Wrong Password',
      //   position: 'TopRight'
      // });
      iziToast.warning({ message: 'Invalid Password' , position: 'bottomCenter'});
    }
    else if (response.status == 404) {

      // iziToast.error({
      //   title: 'User Not Found',
      //   position: 'TopRight'
      // });
      iziToast.warning({ message: 'Invalid Email' , position: 'bottomCenter'});

    }
    else if (response.status == 403) {
      iziToast.warning({ message: 'Account Locked! please contact the administrator' , position: 'bottomCenter'});
    }

    
  }

  $("#loginButton").on("click", function () {
    verifyToken();
    login();
  });

  async function resetPassword() {
    var email = document.getElementById("resetEmailId").value;
    var response = await fetch(api_url + "register/reset", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-auth-token": api_key,
      },
      body: JSON.stringify({ emailId: email }),
    })
    if(response.status == 200){
      iziToast.success({ message: 'Password Reset Successfully!' , position: 'bottomCenter'})
    }
    else if(response.status == 400){
      iziToast.warning({ message: 'User Not Found!' , position: 'bottomCenter'})
    }
    console.log(await response.json())
  }

  $("#resetPasswordButton").on("click", function () {
    resetPassword()
  })

});


// validate email
// document.getElementById('registerButton').addEventListener('click', function () {
//   var inputText = document.getElementById('emailId').value;
//   function ValidateEmail(inputText) {
//     var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//     if (inputText.value.match(mailformat)) {
//       alert("Valid email address!");
//       document.form1.text1.focus();
//       return true;
//     }
//     else {
//       alert("You have entered an invalid email address!");
//       document.form1.text1.focus();
//       return false;
//     }
//   }
// })


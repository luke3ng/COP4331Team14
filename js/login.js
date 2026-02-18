const urlBase = 'http://138.197.13.214/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() 
{
    userId = 0;
    firstName = "";
    lastName = "";

    // Pulling from HTML IDs
    let login = document.getElementById("login-username").value;
    let password = document.getElementById("login-password").value;

    // Matches Login.php: $inData["login"] and $inData["password"]
    let tmp = { login: login, password: password };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				//Added to fix login saving user info (nikki)
				localStorage.setItem("userId", userId);
                localStorage.setItem("firstName", firstName);
                localStorage.setItem("lastName", lastName);

				saveCookie();
	
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function doSignup() 
{
    let fname = document.getElementById("signup-fname").value;
    let lname = document.getElementById("signup-lname").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;

    // Matches Signup.php: $inData["firstname"], ["lastname"], ["email"], ["password"]
    let tmp = {
        firstname: fname,
        lastname: lname,
        email: email,
        password: password
    };
    
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error.length > 0) {
                    alert("Signup Error: " + jsonObject.error);
                    return;
                }

                alert("Account created! Logging you in...");
                
                // Auto-login after successful signup
                userId = jsonObject.id;
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

				if (userId > 0) {
                	//Added to save data to the contacts page (nikki)
        			localStorage.setItem("userId", userId);
        			localStorage.setItem("firstName", jsonObject.firstName);
        			localStorage.setItem("lastName", jsonObject.lastName);

        			//Added to redirect the page
        			window.location.href = "contacts.html"; 

					//Only saves on successful login
					saveCookie();
    			} else {
       		    	document.getElementById("loginResult").innerHTML = "User/Password incorrect";
    			}
                
                //window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        alert("Connection Error: " + err.message);
    }
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function toggleForms() 
{
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm && signupForm) {
        loginForm.classList.toggle('hidden');
        signupForm.classList.toggle('hidden');
    }
}

import React from 'react';
import * as firebase from "firebase/app";
import "firebase/auth";
import './App.css';
import firebaseConfig from './firebase.confiq';
import { useState } from 'react';


firebase.initializeApp(firebaseConfig);
function App() {
  const provider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const[newUser, setNewUser] = useState(false);
  const[user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
    
  })
  


  const handleSignIn = () => {
   firebase.auth().signInWithPopup(provider)
   .then(res => {
     const{displayName, photoURL, email} = res.user;

     const signInUser = {
       isSignedIn: true,
       name: displayName,
       email: email,
       photo: photoURL
     }
     setUser(signInUser);

     console.log(displayName,  email, photoURL);
   })
   .catch(err => {
     console.log(err);
     console.log(err.message);
   })
  }
  const handleFBLogin = () =>{
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res => {
      const signOutUser = {
        isSignedIn: false,
        name:'',
        photo :'',
        email: '',
        error: '',
        success: false

      }
      setUser(signOutUser);
      console.log(res);
    })
    .catch(err => {

    })

  }
  const handleBlur = (e) => {
  
    // console.log(e.target.name , e.target.value);
    let isFieldValid = true;
    if(e.target.name === 'email'){
      isFieldValid  = /\S+@\S+\.\S+/.test(e.target.value);
      
    }

    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if(isFieldValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  const handleSubmit = (e) => {
    // console.log(user.email, user.password)
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res=>{
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name);
      })
      .catch(error => {
        // Handle Errors here.
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        
      });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log('sign in user info', res.user)
      })
      .catch(function(error) {
         const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }


    e.preventDefault();
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

        user.updateProfile({
          displayName: name
        
        }).then(function() {
          console.log('username update successfully')
        }).catch(function(error) {
          console.log(error)
        });
  }

  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}> Sign out</button>
                         : <button onClick={handleSignIn}> Sign in</button>
      }
      <br/>
      <button onClick={handleFBLogin}>Sign in using Facebook</button>
      {
        user.isSignedIn && <div>
          <p>welcome, {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt=""/>
          </div>
      }
     
      <h1>Our Own Authentication</h1>
      <input type="checkbox" onChange ={ () => setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">New User sign Up</label>
      <form onSubmit={handleSubmit}>
      {newUser && <input name="name" type="text" onBlur={handleBlur} placeholder="Your name"/>}
     <br/>
      <input type="text" name="email" onBlur={handleBlur} placeholder="your email address" required/>
      <br/>
      <input type="password" name="password" id="" onBlur={handleBlur} placeholder="your password" required/>
      <br/>
      <input type="submit" value={newUser ? 'Sign up' : 'Sign In'}/>
      </form>
      <p style={{color:'red'}}>{user.error}</p>
      {user.success && <p style={{color:'green'}}>user {newUser ? 'created' : 'logged in'} successfully</p>}
    </div>
  );
}

export default App;

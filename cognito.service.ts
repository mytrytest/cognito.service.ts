import { Injectable } from '@angular/core';
import { 
  CognitoUserPool, 
  CognitoUser, 
  AuthenticationDetails, 
  CognitoRefreshToken,
  CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { environment } from 'src/environments/environment';


const poolData = {
  UserPoolId: environment.cognitoUserPoolId,
  ClientId: environment.cognitoAppClientId
};

const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  constructor() { }

  //User verification after sign up
  confirmSignUp(email:string, code:string): Promise<any> {
    let userData = { Username: email, Pool: userPool };

    let cognitoUser = new CognitoUser(userData);
    
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, function (err, result) {
       if (err) {
        reject(err);
       } else {
        resolve(result);
       }
      });
     });

  }

  //Sign in functionality 
  signIn(username: string, password: string): Promise<any> {
    const authenticationData = {
      Username: username,
      Password: password
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userData = {
      Username: username,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => resolve(result),
        onFailure: err => reject(err)
      });
    });
  }

  //Sign up functionality
  signUp(email: string, password: string, username: string): Promise<CognitoUser | undefined> {
    const attributeList: CognitoUserAttribute[] = [];

    const dataEmail = {
      Name: 'name',
      Value: username
    };

    const attributeEmail = new CognitoUserAttribute(dataEmail);
    attributeList.push(attributeEmail);

    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result?.user);
        }
      });
    });
  }

  //generate new access token and id token from refreshtoken
  refreshToken(userId: any, refreshToken: any): Promise<any> {
    const userData = {
      Username: userId,
      Pool: userPool
    };
  
    const cognitoUser = new CognitoUser(userData);
    const refreshToken1 = new CognitoRefreshToken({ RefreshToken: refreshToken });
  
    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(refreshToken1, (error, session) => {
        if (error) {
          console.log('Token refresh failed:', error);
          reject(error);
        } else {
          console.log(session);
          // Use the new access token as needed
          localStorage.setItem("accessToken", session.getAccessToken().getJwtToken());
          localStorage.setItem("refreshToken", session.getRefreshToken().getToken());
          localStorage.setItem("idToken", session.getIdToken().getJwtToken());
          resolve(session);
        }
      });
    });


  }


  //Sign out functionality 
  signOut(): void {
    let cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      cognitoUser.signOut();
    }

    localStorage.clear();
  }


  //Forgot password - sent email by cognito 
  forgotPassword(username: string): Promise<any> {
    
    const userData = {
      Username: username,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: function (result) { 
          //console.log(result); 
          resolve(result); } ,
        onFailure: function (err)  { 
          //console.log(err); 
          reject(err); } 
        
      });
    });
  }


   //Confirm password cognito methold 
   confirmPassword(code: string, newPassword: string, userId: string): Promise<any> {
    
    const userData = {
      Username: userId,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: function (result) { 
          //console.log(result); 
          resolve(result); } ,
        onFailure: function (err)  { 
          //console.log(err); 
          reject(err); } 
        
      });
    });
  }

}

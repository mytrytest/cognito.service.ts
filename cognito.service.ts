import { Injectable } from '@angular/core';
import { 
  CognitoUserPool, 
  CognitoUser, 
  AuthenticationDetails, 
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

}

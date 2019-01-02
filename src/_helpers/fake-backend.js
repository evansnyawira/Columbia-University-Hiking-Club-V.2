// array in local storage for registered userslet users = JSON.parse(localStorage.getItem('users')) || [];let hikes = JSON.parse(localStorage.getItem('hikes')) || [];// let hikeReqs = JSON.parse(localStorage.getItem('hikereqs')) || [];export function configureFakeBackend () {  let realFetch = window.fetch;  window.fetch = function (url, opts) {    return new Promise((resolve, reject) => {      // wrap in timeout to stimulate server api call      setTimeout(() => {        // authenticate        if (url.endsWith('/users/authenticate') && opts.method === 'POST') {          // get parameters from post request          let params = JSON.parse(opts.body);          // find if any user matches login credentials          let filteredUsers = users.filter(user => {            return user.email === params.email && user.password === params.password;          });          if (filteredUsers.length) {            // if login details are valid return user details and fake jwt token            let user = filteredUsers[0];            let responseJson = {              id: user.id,              email: user.email,              firstName: user.firstName,              lastName: user.lastName,              token: 'fake-jwt-token',            };            resolve({ok: true, text: () => Promise.resolve(JSON.stringify(responseJson))});          } else {            reject('Username or password is incorrect');          }          return;        }        // get users        if (url.endsWith('/users') && opts.method === 'GET') {          // check for fake auth token in header and return users if valid, this security is implemented server side in a real application          if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {            resolve({ok: true, text: () => Promise.resolve(JSON.stringify(users))});          } else {            // return 401 not authorized if token is null or invalid            reject('Unauthorised');          }          return;        }        // get user by id        if (url.match(/\/users\/\d+$/) && opts.method === 'GET') {          // check for fake auth token in header and return user if valid, this security is implemented server side in a real application          if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {            // find user by id in users array            let urlParts = url.split('/');            let id = parseInt(urlParts[urlParts.length - 1]);            let matchedUsers = users.filter(user => { return user.id === id; });            let user = matchedUsers.length ? matchedUsers[0] : null;            // respond 200 OK with user            resolve({ok: true, text: () => JSON.stringify(user)});          } else {            // return 401 not authorised if token is null or invalid            reject('Unauthorized');          }          return;        }        // update user        if (url.match(/\/users\/\d+$/) && opts.method === 'PUT') {          // check for fake auth token in header and return user if valid, this security is implemented server side in a real application          if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {            // find user by id in users array            let urlParts = url.split('/');            let id = parseInt(urlParts[urlParts.length - 1]);            let matchedIndex = null;            for (let i = 0; i < users.length; i++) {              if (users[i].id === id) {                matchedIndex = i;              }            }            let user = matchedIndex ? users[matchedIndex] : null;            // validation            if (user) {              reject('User does not exist');            }            // get new user object from put body            let newDetails = JSON.parse(opts.body);            // save new user details            users[matchedIndex] = newDetails;            localStorage.setItem('users', JSON.stringify(users));            // respond 200 OK            resolve({ok: true, text: () => Promise.resolve()});          } else {            // return 401 not authorised if token is null or invalid            reject('Unauthorized');          }          return;        }        // register user        if (url.endsWith('/users/register') && opts.method === 'POST') {          // get new user object from post body          let newUser = JSON.parse(opts.body);          // validation          let duplicateUser = users.filter(            user => { return user.email === newUser.email; }).length;          if (duplicateUser) {            reject('Email "' + newUser.email + '" is already taken');            return;          }          // save new user          newUser.id = users.length ? Math.max(...users.map(user => user.id)) + 1 : 1;          users.push(newUser);          localStorage.setItem('users', JSON.stringify(users));          // respond 200 OK          resolve({ok: true, text: () => Promise.resolve()});          return;        }        // delete user        if (url.match(/\/users\/\d+$/) && opts.method === 'DELETE') {          // check for fake auth token in header and return user if valid, this security is implemented server side in a real application          if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {            // find user by id in users array            let urlParts = url.split('/');            let id = parseInt(urlParts[urlParts.length - 1]);            for (let i = 0; i < users.length; i++) {              let user = users[i];              if (user.id === id) {                // delete user                users.splice(i, 1);                localStorage.setItem('users', JSON.stringify(users));                break;              }            }            // respond 200 OK            resolve({ok: true, text: () => Promise.resolve()});          } else {            // return 401 not authorised if token is null or invalid            reject('Unauthorized');          }          return;        }        // register user for a hike        /*         API: /hike-register/[userid]/[hikeid]/         METHOD: PUT         PERMISSIONS: user         1. check for fake auth token and return user if valid, else return unauthorized         2. find user by id         3. find hike by id         4. check if hike exists, else return hike DNE error         5. add user to hike.hikers list         6. save new hikes object         */        if (url.match(/\/hike-register\/\d+\/\d+$/) && opts.method === 'PUT') {          if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {            // parse url to find userid and hikeid            let urlParts = url.split('/');            let userid = parseInt(urlParts[urlParts.length - 2]);            let hikeid = parseInt(urlParts[urlParts.length - 1]);            let userMatch = null, hikeMatch = null;            // find user by userid in users array            for (let u = 0; u < users.length; u++) {              let userT = users[u];              if (userT.id === userid) {                userMatch = u;                break;              }            }            // find hike by hikeid in hikes array            for (let h = 0; h < hikes.length; h++) {              let hikeT = hikes[h];              if (hikeT.id === hikeid) {                hikeMatch = h;                break;              }            }            // check if user and hike exists            if (userMatch && hikeMatch) {              let user = users[userMatch];              // add user to hike.hikers list              hikes[hikeMatch].hikers.push(user);              // log addition to hike object              hikes[hikeMatch].log.push(                `User (${user.firstName} ${user.lastName}, ${user.id}) registered.`,              );              localStorage.setItem('hikes', JSON.stringify(hikes));            } else {              // reject with DNE              reject('User and/or hike do not exist');            }          } else {            // return 401 not authorized if token is null or invalid            reject('Unauthorized');          }        }        // unregister user for a hike        /*         API: /hike-unregister/[userid]/[hikeid]         METHOD: PUT         PERMISSIONS: user         1. check for fake auth token and return user if valid, else return unauthorized         2. find user by id         3. find hike by id         4. if user is registered for hike continue, else return user not registered         5. remove user from hike.hikers list         6. save new hikes object         */        if (url.match(/\/hike-unregister\/\d+\/\d+$/) && opts.method === 'PUT') {          // check for fake auth token in header and return user if valid, this security is implemented server side in a real application          if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {            // parse url to find userid and hikeid            let urlParts = url.split('/');            let userid = parseInt(urlParts[urlParts.length - 2]);            let hikeid = parseInt(urlParts[urlParts.length - 1]);            let userMatch = null, hikeMatch = null;            // find user by userid in users array            for (let u = 0; u < users.length; u++) {              let userT = users[u];              if (userT.id === userid) {                userMatch = u;                break;              }            }            // find hike by hikeid in hikes array            for (let h = 0; h < hikes.length; h++) {              let hikeT = hikes[h];              if (hikeT.id === hikeid) {                hikeMatch = h;                break;              }            }            // check if user and hike exists            if (userMatch && hikeMatch) {              let user = users[userMatch], hike = hikes[hikeMatch];              // find user in hike.hikers list              for (let hh = 0; hh < hike.hikers.length; hh++) {                if (user.id === hike.hikers[hh].id) {                  // remove user from hike.hikers list;                  hikes[hikeMatch].hikers.splice(hh, 1);                  // log addition to hike object                  hikes[hikeMatch].log.push(                    `User (${user.firstName} ${user.lastName}, ${user.id}) unregistered.`,                  );                  localStorage.setItem('hikes', JSON.stringify(hikes));                  break;                }              }            } else {              // reject with DNE              reject('User and/or hike do not exist');            }          } else {            // return 401 not authorized if token is null or invalid            reject('Unauthorized');          }        }        // request hike        /*         API: /hike-request         METHOD: POST         PERMISSIONS: user         1. create new hike object with posted object (max(id) + 1)         2. push to hikeReqs         3. save new hikeReqs         */        // if (url.endsWith('/hike-request') && opts.method === 'POST') {        //   // check for fake auth token in header and return user if valid, this security is implemented server side in a real application        //   if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {        //        //   }        // }        // get all hikes        /*         API: /hikes         METHOD: GET         PERMISSIONS: none         1. return Promise with hikes data         */        // get hike by id        /*         API: /hikes/[hikeid]         METHOD: GET         PERMISSIONS: none         1. find hike by id         2. return Promise with hike data         */        // update hike by id        /*         API: /hikes/[hikeid]         METHOD: PUT         PERMISSIONS: admin, leaders         1. check for fake auth token and return user if valid, else return unauthorized         2. find hike by id         3. get body data         4. save new hike data         2. return Promise with hike data         */        // delete hike by id        /*         API: /hikes/[hikeid]         METHOD: DELETE         PERMISSIONS: admin         1. check if hike exists, else return DNE error         1. find hike by id         2. delete hike element         3. save new hike data         */        // pass through any requests not handled above        realFetch(url, opts).then(response => resolve(response));      }, 500);    });  };}
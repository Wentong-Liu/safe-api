# About

This project is a general solution for the below scenario:

* There are many clients who will be making requests over the network.

* Each client has an unique identity that needs to be authenticated by provided user credentials.

* After authentication, requests are distinguished by an identity token provided by the server.

* Identity tokens has an expire time and can be invalidated manually.

* Requests need to be protected from brute-force attack, reply attack or man-in-the-middle attack.

# Feature

* Use Redis to store identity tokens.

* Use timestamp and nonce to protect from reply attack.

* Use SSL to protect man-in-the-middle attack

* Use SHA-256 to calculate signature to prevent from brute-force.
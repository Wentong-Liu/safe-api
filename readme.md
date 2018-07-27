# About

This project is a general solution for the below scenario:

* There are *many* clients who will be making requests over the network.

* Each client has an unique *identity* that needs to be authenticated by the provided *user credential*.

* After authentication, the server will issue a random secure `identity token` and a random secure `secret` to the client.

* A client needs to use the provided `identity token` to prove its identity.

* A client needs to use the provided `secret` to sign subsequent requests.

* Secret tokens can have an *expire time* and can be invalidated *manually*.

* Requests need to be protected from *brute-force attack*, *reply attack* or *man-in-the-middle* attack.

* Requests are passed over `POST` method and payloads are in `JSON` format.

# Feature

* Use Redis to store identity tokens.

* Use timestamp and nonce to protect from reply attack.

* Use SSL to protect man-in-the-middle attack

* Use SHA-256 to calculate signature to prevent from brute-force.

* Use HTTP header to pass the identity token and signature.

* Use identity token instead of username to avoid disclose login credentials.
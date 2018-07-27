# About

This project is a general solution for the below scenario:

* There are **many** clients who will be making requests over the network.

* Each client has an unique **identity** that needs to be **authenticated** by the provided *user credential*.

* After authentication, the server will issue a random secure `identity token` and a random secure `secret` to the client.

* A client needs to use the provided `identity token` to prove its **identity**.

* A client needs to use the provided `secret` to **sign** subsequent requests.

* `Identity tokens` can have an **expire time** and can be **invalidated manually**.

* Requests need to be **protected from** *brute-force attack*, *reply attack* or *man-in-the-middle* attack.

* Requests are passed over `POST` method and payloads are in `JSON` format.

# Feature

* Use Redis to cache identity tokens.

* Use `timestamp` and `nonce` with configurable expire time to protect from *reply attack*.

* TODO: Use SSL to protect from _man-in-the-middle attack_.

* Use `SHA-256` to calculate signature to prevent from _brute-force_.

* Use HTTP header to pass the identity token and the signature for a better compatibility.

* Use identity token instead of username to avoid disclosing login credentials.
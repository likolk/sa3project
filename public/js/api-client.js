api = function() {

    /* Quiz 1 */
    // Function to determine the outcome of a fetch request.
    // Will return a promise that resolves with a JSON object if the status code is 200 or 201.
    // Will return undefined if the status code is 204. Will throw the status code otherwise.
    function validateResponse(res) {
        /* Quiz 2 */
        if (res.status == 200 || res.status == 201) {
            return res.json();  /* Quiz 3: returns a promise which resolves to an object parsed from the response body */
        } if (res.status == 204) {
            return;
        } else {
            throw res.status;
        }
    }

    /* Quiz 4 */
    // Helper function to send out an HTTP request with the given method, url, optional body and headers. 
    // It assumes that the request and response body are encoded using JSON strings.
    async function _fetchJSON(method, url, body, headers) {

        /* Quiz 5 */
        function addHeaders(headers) {
            /* Quiz 6 */
            let newHeaders = {...headers};
            /* Quiz 7 */
            newHeaders['Accept'] = 'application/json';
            /* Quiz 8 */
            if (method == 'POST' || method == 'PUT' || method == 'PATCH')
              newHeaders['Content-Type'] = 'application/json';
            return newHeaders;
          }

        /* Quiz 8 */
        if (method === 'POST' || method == 'PUT' || method == 'PATCH') {
            body = JSON.stringify(body);
        }

        /* Quiz 9 */
        // Asynchronously call fetch with the given url and options and assign
        //  the response object when the promise resolves
        const res = await fetch(url, { method, headers: addHeaders(headers), body });
        return validateResponse(res);

    }

    /* Quiz 10 */
    // Helper function to send out an HTTP request with the given method, url, optional body and headers.
    // It assumes that the response body is encoded using JSON strings, it will directly pass the body parameter to fetch. 
    // Recommended to use to POST or PUT form data objects.
    async function _fetchFORM(method, url, body, headers) {

        function addHeaders(headers) {
            let newHeaders = {...headers};
            newHeaders['Accept'] = 'application/json';
            return newHeaders;
          }

        /* Quiz 9 */
        // waits for the promise returned by fetch to resolve to the response object
        const res = await fetch(url, { method, headers: addHeaders(headers), body });
        return validateResponse(res);

    }

    function get_all_posts() {
        return _fetchJSON("GET", "/posts");
    }

    function get_all_users() {
        return _fetchJSON("GET", "/users/users_list");
    }

    function get_all_tags() {
        return _fetchJSON("GET", "/tags");
    }

    function get_question(id) {
        return _fetchJSON("GET", "/questions/" + id);
    }

    function post_question(form_data) {
        return _fetchJSON("POST", "/questions/ask", form_data);
    }

    function post_answer(id, form_data) {
        return _fetchJSON("POST", "/questions/answer/" + id, form_data);
    }

    function get_stuff(id) {
        console.log("gang");
        return _fetchJSON("GET", "/users/" + id);
    }

    function get_questions_by_tags(name) {
        return _fetchJSON("GET", "/tags/" + name);
    }
    
    /* Quiz 15 */
    // Define the public methods of the api object
    return {
        get_all_posts,
        get_all_users,
        get_all_tags,
        get_question,
        post_question,
        post_answer,
        get_stuff,
        get_questions_by_tags
    }

}(); /* Quiz 16 */ // () invokes the function directly to create the api object
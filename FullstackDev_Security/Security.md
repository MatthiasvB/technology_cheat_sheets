[a]: ./icon_question.svg
[aa]: ./icon_suggestion.svg
[aaa]: ./icon_answer.svg

<style>
img[alt="icon"] {
    width: 20px;
    position: relative;
    top: 3px;
}
</style>

# Security things to be considered in fullstack development

## Questions

![icon][a]
What is the purpose of the same-origin-policy? I thought it was to prevent cross-site-scripting attacks. Meaning to keep external JavaScript out. But if it's set by the server, that doesn't seem to make a lot of sense...

![icon][aaa]
That's right, it is to prevent cross-site-scripting. Where do these scripts run? In the Browser! So, a lot of security practices firmly assume that your browser is uncorrupted and trying to protect you. So _it_ will not attempt to send data to an endpoint that does not want it, if would originate from an unknown domain.

![icon][a]
Why is the `Access-Control-Allow-Origin` header set by the Server? It would seem to be more important for the client?

![icon][aaa]
Same answer: Your browser decides not to send certain requests to origins that are not its own, except for when an `Access-Control-Allow-Origin` header explicitly allows it to do so.

![icon][a]
How does the the server _or_ the client verify the origin of a request? Isn't that easy to fake?

![icon][aaa]
Yes! Same answer again: This all to protect the client, not the server. And the assumption is that the client would have no motivation to fake anything.

They may be one or two more things to be considered security wise. These are just questions I had in my early days.
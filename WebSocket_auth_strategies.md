# WebSocket auth strategies

**So I needed a way to authenticate Websocket connections. These were my thoughts. It's a bit specific to my setup, but you can probably take the gist from it**

WebSockets are weird. They pretend to be an extension to the HTTP protocol, but really, the commonalities are rather slim. Our crucial problem: It is not possible to attach most headers to the connection request. This can make it difficult to use the same auth scheme for HTTP and WebSockets. Cookies are attached, though, but what if you can't use cookies?

Also, there seems to be no established standard for auth with WebSockets. There are some patterns one can use, but that means interacting with the protocol on a fairly low level, which means we can't leverage libraries like `msal` or PassportJS that are designed to be easy to use and secure. Instead, we have to brew our own. To decide what to brew, here are a few options, for which I'll try to workout the advantages and downsides:
1. **Using cookies**  
Cookies are a great option, especially if your auth scheme uses them anyway. While one can set only a single header with JavaScript (`Sec-WebSocket-Protocol`), cookies are automatically attached to the connection request. Quite likely, you won't have to adapt your infrastructure at all.  
Positive:
   - Likely no additional logic and as secure as your scheme in general

   Negative
   - Only works if you can use cookies
2. **A ticket-based system**  
As explained in this [blogpost](https://devcenter.heroku.com/articles/websocket-security), one scheme one typically uses is a ticket system, which can be broken down into the following steps:
   1. Client makes HTTP request to ask for ticket, which typically contains information like user-ID, connecting IP, timestamp etc.
   2. The server generates this ticket, saves it internally and returns it to the client.
   3. The client opens a WebSocket connection and sends this ticket as the first message.
   4. The server validates the ticket and confirms the connection if everything is okay. 

   Unfortunately, this leaves open all questions as to how this ticket is made so that it can not easily be faked. It would probably have to be encrypted, or possibly just be a hash of the original ticket information. This will need to be explored further.

   Positive:
   - Inofficial standard
   - Does not depend on specific library

   Negative:
   - Needs a lot of low level code and requires the developer to take care of the session
   - Not exactly a step-by-step tutorial
3. **Reusing the bearer token and as much existing logic as possible**  
With Azure AD, we have a bearer token available, probably in session or local storage. We might as well use this to authenticate the WebSocket, too. We just have to learn how to handle it.
   1. First, we could figure out which of the records in the local storage is the token that is sent with HTTP-requests. We could then access this token and send it when we open the WebSocket connection. 
   2. In the backend, we can try to abuse `passport-azure-ad` logic to validate the token. One could try to use the passport authorization middleware, by passing fake `req`, `res` and `next` objects/functions. The middleware could then do its thing, and we know everything is okay if `next` is called.

   Alternatively, we could see if there might be a way for us to validate the token ourselves, without the `passport-azure-ad` logic.

   Positive:
   - Re-use existing logic
   - Potentially as secure as HTTP access

   Negative:
   - Kinda hacky

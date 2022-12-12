function saveContent() {
    // Get the current date and time in the local timezone
    const currentDate = new Date();
    // Format the filename as "CHATGTP-DDMMYY-HHMM"
    const month = currentDate.getMonth() + 1; // 0-based index
    const day = currentDate.getDate();
    const year = currentDate.getFullYear();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const filename = `CHATGTP-${month}${day}${year}-${hours}${minutes}.txt`;

    const style = "<style> pre {    font-size: 1.2em; border: 2px solid grey; width: 90%;    border-left: 12px solid green;    border-radius: 5px;    padding: 14px; line-height: 24px;background-image: linear-gradient(180deg, #eee 50%, #fff 50%); background-size: 100% 48px; background-position: 0 14px;  }  .p-4{ word-wrap: normal;    background: none; color: #fff; } .question, .answer {  border: 1px solid rgba(0, 0, 0, 0.125);        border-radius: 0.25rem;        padding: 1em;        margin-bottom: 1em;      } .bg-black {--tw-bg-opacity: 1; background-color: rgba(0,0,0,var(--tw-bg-opacity)); } .question {        box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px; background-color: #d8d8d8; } .answer { box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px; background-color: ##fbfbfb; border-bottom: 1px solid black; } h1{ text-align: center; font-size: 2.5em; font-weight: bold;    background-image: linear-gradient(to left, #999999, #CCCCCC);    color: transparent;    background-clip: text;    -webkit-background-clip: text;}</style><h1>CHATGTP Saved Thread</h1>";
    const pageChatInfo = `<div class='pageinfo'> Date saved:${day}-${month}-${year} at ${hours}h${minutes}<br/><br/></div>`;
    
    function getMain(){
        const mainElement = document.querySelectorAll(".items-start");
        const mainHtml = [];
        mainElement.forEach(element => {
             mainHtml.push(element.innerHTML);
        });
      return mainHtml;
    }
  
    // Get the content of the main element on the current page
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript(
        {
          target: {tabId: tabs[0].id, allFrames: true},
          func: getMain,
        },
        results => {

            const content = results[0];
            const field = "result";
            const value = content[field];
            // Stringify the content object
            const contentString = JSON.stringify(value);
           // console.log("test2"+contentString);
            //on va travailler now pour formatter ce texte on va mettre le resultat 

            // First, we need to convert the string into an array
            const array = contentString.substring(1, contentString.length - 1).split("\",\"");

                // Then, we can loop through the array and add the text you want to each value
            let resultString = "";
            for (let i = 0; i < array.length - 1; i += 2) {
                // Remove the square bracket from the first value in the array
                let value1;
                if(i===0){
                    value1 = array[i].substring(1);
                }
                else{
                    value1 = array[i];
                }
                const value2 = array[i + 1];

                resultString += "<div class='question'><b>Q: </b>" + value1 + "</div>";
                resultString += "<div class='answer'><b>A: </b>"+ value2 + "</div>";
            }

                // Finally, we can put the result back into a const variable
                resultString = resultString.replace(/\\"/g, "").replace(/\\n/g, "<br>");
                const result = resultString;

            // Encode the content string as a base64-encoded string
            const contentEncoded = btoa(style + pageChatInfo+ result);

            const contentFormatted =  contentEncoded; //.replace(/^"|"$/g, "");

            // Create a data URI for the Blob object, encoded as a base64-encoded string
            const dataUri = 'data:text/html;base64,' + contentFormatted;
  
            // Use the chrome.downloads.download function to download the Blob as a file
            chrome.downloads.download({url: dataUri, filename: filename});
        }
      );
    });
  }
  
  // Listen for clicks on the browser action button
  chrome.action.onClicked.addListener(saveContent);
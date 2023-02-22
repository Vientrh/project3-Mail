document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //when form submit
  document.querySelector('form').onsubmit = send_email;
  //document.querySelector('form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id){
  console.log(id);
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      
      // hide compose view and hide other views
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-detail-view').style.display = 'block';
      
      document.querySelector('#emails-detail-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item">From:</strong> ${email.sender}</li>
        <li class="list-group-item">To:</strong> ${email.recipients}</li>
        <li class="list-group-item">Subject:</strong> ${email.subject}</li>
        <li class="list-group-item">From:</strong> ${email.timestamp}</li>
        <li class="list-group-item">Vestibulum at eros</li>
      </ul>
      `

      //change to read
      if(!email.read){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }

      //Archive/Unarchive feature
      // create a button
      const btn_archived = document.createElement('button');
      btn_archived.innerHTML = email.archived ? "Unarchived" : "Archived";
      btn_archived.className = email.archived ? "btn btn-primary" : "btn btn-danger";;
      btn_archived.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => {load_mailbox('archive')});
    
      });
      document.querySelector('#emails-detail-view').append(btn_archived);
      
      //reply button
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "reply";
      btn_reply.className = "btn btn-info";
      btn_reply.addEventListener('click', function() {
        compose_email();
        // Pre-fill reply composition fields
        document.querySelector('#compose-recipients').value = email.sender;

        let subject = email.subject;
        if(subject.split(' ', 1)[0] != "Re:"){
          subject = "Re: " + email.subject;
        }
        document.querySelector('#compose-subject').value = subject;
        
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector('#emails-detail-view').append(btn_reply);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Loop through all email & create each div for each email
      emails.forEach(email => {
        // Print email
        console.log(email);

        const element = document.createElement('div');
        element.className = "list-group-item";
        element.innerHTML = `
          <h5>Sender: ${email.sender} </h5>
          <h5>Subject: ${email.subject} </h5>
          <h5>${email.timestamp} </h5>
        `;        

        //change colour 
        if (email.read == true){
          element.style.backgroundColor = "grey";
        } else {
          element.style.backgroundColor = "white";
        }
       

        //Click event to see email
        element.addEventListener('click', function() {
            view_email(email.id)
        });
        document.querySelector('#emails-view').append(element);
      })
});
}

function send_email(event) {
  event.preventDefault();
  
  // collect composition fields values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      //Load user's sent mailbox
      load_mailbox('sent');
  });
  //to prevent submit the form elsewhere
  return false;
  
}



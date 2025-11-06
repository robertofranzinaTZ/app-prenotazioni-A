fetch('/api/bookings')
.then(r=>r.json())
.then(slots=>{
  document.getElementById('slots').innerHTML =
    slots.map(s=>`<button onclick="book(${s.id})">${s.time} (${s.booked}/${s.capacity})</button>`).join('<br>');
});
function book(id){
  fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:"Utente",email:"test@test.com",slot_id:id})})
  .then(r=>r.json()).then(x=>alert(JSON.stringify(x)));
}

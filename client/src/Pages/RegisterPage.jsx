import React from 'react'
import { useState } from 'react'

function RegisterPage() {
    const [username,setUsername]=useState('')
    const [password,setPassword]=useState('')
    async function register(ev){
        ev.preventDefault();
        
      const response=  await fetch('http://localhost:4000/register',{
            method:'POST',
            body: JSON.stringify({username,password}),
            headers:{'Content-Type':'application/json'},
        })

        if(response.status===200){
            alert('registration successful')
        } else{
            alert('registration failed')
        }
    }
  return (
    <form action=""className='register' onSubmit={register}>
    <h1>Register</h1>

    <input type="text" 
    placeholder='Username' 
    value={username} 
    onChange={ev=>setUsername(ev.target.value)}
    />

    <input type="text" 
    placeholder='Password' 
    value={password}
    onChange={ev=>setPassword(ev.target.value)}
    />
    <button>Register</button>
</form>
  )
}

export default RegisterPage

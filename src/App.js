import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import SignUp from './components/SignUp';
import ConfirmSignUp from './components/ConfirmSignUp';
import Login from './components/Login';
import Success from './components/Success';

function App() {
    return (<Router>
        <div className="App">
            <Routes>
                <Route path="/" element={<SignUp/>}/>
                <Route path="/confirm" element={<ConfirmSignUp/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/success" element={<Success/>}/>
            </Routes>
        </div>
    </Router>);
}

export default App;
import { useState } from "react";
import { registerUser } from "../../services/authService";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await registerUser({
        username,
        email,
        password,
      });

      console.log(data);

      alert("Register Berhasil");

      setUsername("");
      setEmail("");
      setPassword("");

    } catch (error) {
        console.error("FULL ERROR:", error);

        console.log("RESPONSE:", error.response);

        console.log("DATA:", error.response?.data);

        alert(
            error.response?.data?.message ||
            "Register Gagal"
        );
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <br />

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        <br />

        <button type="submit">
          Register
        </button>

      </form>
    </div>
  );
}

export default RegisterPage;
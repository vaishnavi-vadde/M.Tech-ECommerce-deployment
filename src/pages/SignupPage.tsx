import { useState, type FormEvent } from "react";
import { signup } from "../api/authApi";

interface SignupPageProps {
    setPage: (page: string) => void;
}

type UserRole = "ADMIN" | "USER";

function SignupPage({
    setPage
}: SignupPageProps) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<UserRole>("USER");
    const [message, setMessage] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        try {

            const response = await signup({
                name,
                email,
                password,
                role
            });

            setMessage(response);

            setName("");
            setEmail("");
            setPassword("");
            setRole("USER");

            // Go to Sign In after successful signup
            setTimeout(() => {
                setPage("signin");
            }, 1000);

        } catch (error) {

            console.error(
                "Signup error:",
                error
            );

            setMessage("Signup failed");
        }
    };

    return (
        <div className="auth-container">

            <h2>
                Signup
            </h2>

            <form
                onSubmit={handleSubmit}
            >

                <label>
                    Name
                </label>

                <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    required
                />

                <label>
                    Email
                </label>

                <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    required
                />

                <label>
                    Password
                </label>

                <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    required
                />

                <label>
                    Role
                </label>

                <select
                    value={role}
                    onChange={(event) =>
                        setRole(
                            event.target.value as UserRole
                        )
                    }
                >

                    <option value="USER">
                        USER
                    </option>

                    <option value="ADMIN">
                        ADMIN
                    </option>

                </select>

                <button
                    type="submit"
                >
                    Signup
                </button>

            </form>

            {message && (
                <p className="form-message">
                    {message}
                </p>
            )}

        </div>
    );
}

export default SignupPage;
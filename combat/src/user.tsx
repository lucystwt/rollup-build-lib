import { getFullName } from "./string"

export interface UserProps {
  image: string
  firstName: string
  lastName: string
  description?: React.ReactNode
}

const User: React.FC<UserProps> = ({
  image,
  firstName,
  lastName,
  description,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src={image}
        style={{
          width: 66,
          height: 66,
          border: "1px solid #ccc",
          borderRadius: "50%",
          padding: 8,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "start",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          {getFullName(firstName, lastName)}
        </div>
        {description && <div>{description}</div>}
      </div>
    </div>
  )
}

export default User

import { getFullName } from "./string"
import styles from "./user.css"

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
    <div className={styles.container}>
      <img src={image} />
      <div className={styles.user_info}>
        <div className={styles.full_name}>
          {getFullName(firstName, lastName)}
        </div>
        {description && <div>{description}</div>}
      </div>
    </div>
  )
}

export default User

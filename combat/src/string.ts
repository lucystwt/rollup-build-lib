export const getFullName = (firstName: string, lastName: string) => {
  let _firstName = firstName.replace(/\s+/g, "")
  let _lastName = lastName.replace(/\s+/g, "")

  _firstName =
    _firstName.slice(0, 1).toUpperCase() + _firstName.slice(1).toLowerCase()
  _lastName =
    _lastName.slice(0, 1).toUpperCase() + _lastName.slice(1).toLowerCase()

  return `${_firstName} ${_lastName}`
}

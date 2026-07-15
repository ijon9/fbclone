function ProfileImg( {src} ) {
    
  const style = {
    border: "1px solid black",
    borderRadius: "50%"
  }

  return (
    <>
        <img src={src} width="50px" height="50px" alt="temp" style={style}></img>
    </>
  )
}

export default ProfileImg

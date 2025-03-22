import bcrypt from "bcryptjs";


export const hashPassword = async (password:string):Promise<string> => {

    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
    
}

/*

@params hashedPassword From Database  (Hashed)

@params from req.body while loging (Plain Text)

*/


export const comparePassword = async (hashedPassword:string, password:string):Promise<boolean> =>{

   return await bcrypt.compare(password, hashedPassword);
}


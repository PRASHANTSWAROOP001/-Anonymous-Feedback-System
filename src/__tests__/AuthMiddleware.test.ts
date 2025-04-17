import { validateAdmin , AuthenticatedRequest} from "../middleware/AuthMiddleware";
import { verifyToken } from "../utils/jwt";
import { Request, Response, NextFunction } from "express";



jest.mock("../utils/jwt", () => ({
    verifyToken: jest.fn(),
}));


describe("mock validate token middleware", ()=>{
    let mockReq: Partial<AuthenticatedRequest>
    let mockRes: Partial<Response>
    let mocknext:NextFunction


    beforeEach(()=>{
        mockReq = {
            header: jest.fn()
        },
        mockRes = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        ,
        mocknext = jest.fn();
    })

    it("should allow access when token is valid", ()=>{
        (mockReq.header as jest.Mock).mockReturnValue("Bearer Valid Token")
        (verifyToken as jest.Mock).mockReturnValue({id:123, email:"random@email.com", name:"jhon doe"})

        validateAdmin(mockReq as Request, mockRes as Response, mocknext)

        expect(mockReq.user).toEqual({id:123, email:"random@email.com", name:"jhon doe"})

        expect(mocknext).toHaveBeenCalled()

    })

    it("missing token, should be invalidated and return 401", ()=>{
        (mockReq.header as jest.Mock).mockReturnValue(null);

        validateAdmin(mockReq as Request, mockRes as Response, mocknext)

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success:false,
            message:"Token is not present."
        })

        expect(mocknext).not.toHaveBeenCalled()
    })

   
    it("should return 403 if token is invalid", () => {
        (mockReq.header as jest.Mock).mockReturnValue("Bearer invalid_token");
        (verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        validateAdmin(mockReq as Request, mockRes as Response,mocknext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid token.",
        });
        expect(mocknext).not.toHaveBeenCalled();
    })
})
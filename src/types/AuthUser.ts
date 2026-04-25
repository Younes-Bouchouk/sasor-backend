import { Request } from "express"

export type UserTokenData = {
    id: number,
    pseudo: string
}

export type AuthenticatedRequest = Request & {
    user: UserTokenData
}
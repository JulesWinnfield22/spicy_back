import { ImageSize } from "./db/models/ImgesSchema"
import { Schema } from "mongoose"

export const Status = {
	ACTIVE: 'ACTIVE',
	PENDING: 'PENDING',
	DISABLED: 'DISABLED'
}

export const StatusArraay = [Status.ACTIVE, Status.PENDING, Status.DISABLED]

interface DefaultData {
	_id: string,
	createdAt: Date,
	updatedAt: Date,
}

export interface Leed extends CreateLeed, DefaultData {
	service: Service
}

export interface CreateLeed {
	fullName: string,
	email: string,
	phone_number: string,
	service: string | Service,
	product: string,
	destination_country: string,
	message: string
}

export interface User extends RegisterUser, DefaultData {
	status: string,
	salt: string,
	roles?: Role[],
	permissions?: Permission[],
}

export interface RegisterUser {
	firstName: string,
	fathersName: string,
	grandFathersName: string,
	email: string,
	phone_number: string,
	password: string,
	roles?: Role[], // New field for multiple roles
	profile_pic?: string,
	status: string
}

export interface Permission extends CreatePermission, DefaultData{}
export interface CreatePermission {
	name: string;
  description: string;
  code: string;
  category: 'product' | 'view' | 'user' | 'content' | 'analytics' | 'marketing',
  status: 'ACTIVE' | 'DISABLED' | 'PENDING'
}

export interface Role extends CreateRole, DefaultData {}
export interface CreateRole { 
	name: string;
	description: string;
	permissions: Permission[];
	status: 'ACTIVE' | 'DISABLED' | 'PENDING'
}

export interface Service extends CreateService, DefaultData {}
export interface CreateService {
	name: string,
	description?: string,
	image_alt: string,
	service_photo: string,
	extra_service_images?: string[]
}

export interface ServiceDetail extends CreateServiceDetail, DefaultData {}
export interface CreateServiceDetail {
	serviceId: string,
	detailHtml: string
}

export interface Industry extends CreateIndustry, DefaultData {}

export interface Stat extends CreateStat, DefaultData {}

export interface CreateStat {
	industies: number,
	imports: number,
	exports: number
}


export interface CreateIndustry {
	title: string,
	description: string,
	status: string
}

export interface Content extends DefaultData {
	name: string
	content: string,
	alt?: string,
	type: 'text' | 'image'
}

export type FunctionResponse<T> = [err: any | undefined, response: T]

export interface Credential {
	email: string,
	password: string
}

export interface Images extends CreateImage, DefaultData{}

export interface CreateImage {
	name: string,
	size: ImageSize,
	filename: string,
	alt: string
}
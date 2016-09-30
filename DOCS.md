# cblhub-api v0.0.0



- [Activity](#activity)
	- [Create activity](#create-activity)
	- [Delete activity](#delete-activity)
	- [Retrieve activities](#retrieve-activities)
	- [Retrieve activity](#retrieve-activity)
	- [Update activity](#update-activity)
	
- [Auth](#auth)
	- [Authenticate](#authenticate)
	- [Authenticate with Facebook](#authenticate-with-facebook)
	
- [Challenge](#challenge)
	- [Create challenge](#create-challenge)
	- [Delete challenge](#delete-challenge)
	- [Retrieve challenge](#retrieve-challenge)
	- [Retrieve challenges](#retrieve-challenges)
	- [Update challenge](#update-challenge)
	
- [Guide](#guide)
	- [Create guide](#create-guide)
	- [Delete guide](#delete-guide)
	- [Retrieve guide](#retrieve-guide)
	- [Retrieve guides](#retrieve-guides)
	- [Update guide](#update-guide)
	
- [PasswordReset](#passwordreset)
	- [Send email](#send-email)
	- [Submit password](#submit-password)
	- [Verify token](#verify-token)
	
- [Photo](#photo)
	- [Delete photo](#delete-photo)
	- [Retrieve photo](#retrieve-photo)
	- [Retrieve photos](#retrieve-photos)
	- [Update photo](#update-photo)
	
- [Question](#question)
	- [Create question](#create-question)
	- [Delete question](#delete-question)
	- [Retrieve question](#retrieve-question)
	- [Retrieve questions](#retrieve-questions)
	- [Update question](#update-question)
	
- [Resource](#resource)
	- [Create resource](#create-resource)
	- [Delete resource](#delete-resource)
	- [Retrieve metadata](#retrieve-metadata)
	- [Retrieve resource](#retrieve-resource)
	- [Retrieve resources](#retrieve-resources)
	- [Update resource](#update-resource)
	
- [Tag](#tag)
	- [Create tag](#create-tag)
	- [Delete tag](#delete-tag)
	- [Retrieve tag](#retrieve-tag)
	- [Retrieve tags](#retrieve-tags)
	- [Update tag](#update-tag)
	
- [User](#user)
	- [Create user](#create-user)
	- [Delete user](#delete-user)
	- [Retrieve current user](#retrieve-current-user)
	- [Retrieve user](#retrieve-user)
	- [Retrieve users](#retrieve-users)
	- [Update password](#update-password)
	- [Update user](#update-user)
	


# Activity

## Create activity



	POST /activities


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| challenge			| 			|  <p>Activity's challenge.</p>							|
| tags			| 			|  <p>Activity's tags.</p>							|
| title			| 			|  <p>Activity's title.</p>							|
| description			| 			|  <p>Activity's description.</p>							|
| guides			| 			|  <p>Activity's guides.</p>							|
| date			| 			|  <p>Activity's date with format YYYY-MM-DD.</p>							|

## Delete activity



	DELETE /activities/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|

## Retrieve activities



	GET /activities


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| users			| String			|  <p>User's id(s) to filter.</p>							|
| challenges			| String			|  <p>Challenge's id(s) to filter.</p>							|
| guides			| String			|  <p>Guide's id(s) to filter.</p>							|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Retrieve activity



	GET /activities/:id


## Update activity



	PUT /activities/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| challenge			| 			|  <p>Activity's challenge.</p>							|
| tags			| 			|  <p>Activity's tags.</p>							|
| title			| 			|  <p>Activity's title.</p>							|
| description			| 			|  <p>Activity's description.</p>							|
| guides			| 			|  <p>Activity's guides.</p>							|
| date			| 			|  <p>Activity's date with format YYYY-MM-DD.</p>							|

# Auth

## Authenticate



	POST /auth

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>Basic authorization with email and password.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>Master access_token.</p>							|

## Authenticate with Facebook



	POST /auth/facebook


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>Facebook user accessToken.</p>							|

# Challenge

## Create challenge



	POST /challenges


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| title			| 			|  <p>Challenge's title.</p>							|
| bigIdea			| 			|  <p>Challenge's bigIdea.</p>							|
| essentialQuestion			| 			|  <p>Challenge's essentialQuestion.</p>							|
| description			| 			|  <p>Challenge's description.</p>							|

## Delete challenge



	DELETE /challenges/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|

## Retrieve challenge



	GET /challenges/:id


## Retrieve challenges



	GET /challenges


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Update challenge



	PUT /challenges/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| title			| 			|  <p>Challenge's title.</p>							|
| bigIdea			| 			|  <p>Challenge's bigIdea.</p>							|
| essentialQuestion			| 			|  <p>Challenge's essentialQuestion.</p>							|
| description			| 			|  <p>Challenge's description.</p>							|

# Guide

## Create guide



	POST /guides


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| challenge			| 			|  <p>Guide's challenge.</p>							|
| tags			| 			|  <p>Guide's tags.</p>							|
| title			| 			|  <p>Guide's title.</p>							|
| description			| 			|  <p>Guide's description.</p>							|
| guides			| 			|  <p>Guide's guides.</p>							|

## Delete guide



	DELETE /guides/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|

## Retrieve guide



	GET /guides/:id


## Retrieve guides



	GET /guides


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| users			| String			|  <p>User's id(s) to filter.</p>							|
| challenges			| String			|  <p>Challenge's id(s) to filter.</p>							|
| type			| String			|  <p>Guide's type to filter.</p>							|
| guides			| String			|  <p>Guide's id(s) to filter.</p>							|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Update guide



	PUT /guides/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| challenge			| 			|  <p>Guide's challenge.</p>							|
| tags			| 			|  <p>Guide's tags.</p>							|
| title			| 			|  <p>Guide's title.</p>							|
| description			| 			|  <p>Guide's description.</p>							|
| guides			| 			|  <p>Guide's guides.</p>							|

# PasswordReset

## Send email



	POST /password-resets


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| email			| String			|  <p>Email address to receive the password reset token.</p>							|
| link			| String			|  <p>Link to redirect user.</p>							|

## Submit password



	PUT /password-resets/:token


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| password			| String			|  <p>User's new password.</p>							|

## Verify token



	GET /password-resets/:token


# Photo

## Delete photo



	DELETE /photos/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>admin access token.</p>							|

## Retrieve photo



	GET /photos/:id


## Retrieve photos



	GET /photos


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Update photo



	PUT /photos/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>admin access token.</p>							|
| color			| 			|  <p>Photo's color.</p>							|
| thumbnail			| 			|  <p>Photo's thumbnail.</p>							|
| small			| 			|  <p>Photo's small.</p>							|
| medium			| 			|  <p>Photo's medium.</p>							|
| large			| 			|  <p>Photo's large.</p>							|
| owner			| 			|  <p>Photo's owner.</p>							|
| url			| 			|  <p>Photo's url.</p>							|
| title			| 			|  <p>Photo's title.</p>							|

# Question

## Create question



	POST /questions


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| challenge			| 			|  <p>Question's challenge.</p>							|
| tags			| 			|  <p>Question's tags.</p>							|
| title			| 			|  <p>Question's title.</p>							|
| description			| 			|  <p>Question's description.</p>							|
| guides			| 			|  <p>Question's guides.</p>							|

## Delete question



	DELETE /questions/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|

## Retrieve question



	GET /questions/:id


## Retrieve questions



	GET /questions


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| users			| String			|  <p>User's id(s) to filter.</p>							|
| challenges			| String			|  <p>Challenge's id(s) to filter.</p>							|
| guides			| String			|  <p>Guide's id(s) to filter.</p>							|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Update question



	PUT /questions/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| challenge			| 			|  <p>Question's challenge.</p>							|
| tags			| 			|  <p>Question's tags.</p>							|
| title			| 			|  <p>Question's title.</p>							|
| description			| 			|  <p>Question's description.</p>							|
| guides			| 			|  <p>Question's guides.</p>							|

# Resource

## Create resource



	POST /resources


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| url			| String			|  <p>Resource's url.</p>							|
| mediaType			| String			|  <p>Resource's mediaType.</p>							|
| image			| String			|  <p>Resource's image.</p>							|
| challenge			| 			|  <p>Resource's challenge.</p>							|
| tags			| 			|  <p>Resource's tags.</p>							|
| title			| 			|  <p>Resource's title.</p>							|
| description			| 			|  <p>Resource's description.</p>							|
| guides			| 			|  <p>Resource's guides.</p>							|

## Delete resource



	DELETE /resources/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|

## Retrieve metadata



	GET /resources/meta


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| url			| String			|  <p>Url to extract metadata.</p>							|

## Retrieve resource



	GET /resources/:id


## Retrieve resources



	GET /resources


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| users			| String			|  <p>User's id(s) to filter.</p>							|
| challenges			| String			|  <p>Challenge's id(s) to filter.</p>							|
| guides			| String			|  <p>Guide's id(s) to filter.</p>							|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Update resource



	PUT /resources/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>user access token.</p>							|
| url			| String			|  <p>Resource's url.</p>							|
| mediaType			| String			|  <p>Resource's mediaType.</p>							|
| image			| String			|  <p>Resource's image.</p>							|
| challenge			| 			|  <p>Resource's challenge.</p>							|
| tags			| 			|  <p>Resource's tags.</p>							|
| title			| 			|  <p>Resource's title.</p>							|
| description			| 			|  <p>Resource's description.</p>							|
| guides			| 			|  <p>Resource's guides.</p>							|

# Tag

## Create tag



	POST /tags


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>admin access token.</p>							|
| name			| 			|  <p>Tag's name.</p>							|

## Delete tag



	DELETE /tags/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>admin access token.</p>							|

## Retrieve tag



	GET /tags/:id


## Retrieve tags



	GET /tags


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Update tag



	PUT /tags/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>admin access token.</p>							|
| name			| 			|  <p>Tag's name.</p>							|

# User

## Create user



	POST /users


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>Master access_token.</p>							|
| email			| String			|  <p>User's email.</p>							|
| password			| String			|  <p>User's password.</p>							|
| name			| String			| **optional** <p>User's name.</p>							|
| picture			| String			| **optional** <p>User's picture.</p>							|
| role			| String			| **optional** <p>User's picture.</p>							|

## Delete user



	DELETE /users/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>User access_token.</p>							|

## Retrieve current user



	GET /users/me


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>User access_token.</p>							|

## Retrieve user



	GET /users/:id


## Retrieve users



	GET /users


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>User access_token.</p>							|
| q			| String			| **optional** <p>Query to search.</p>							|
| page			| Number			| **optional** <p>Page number.</p>							|
| limit			| Number			| **optional** <p>Amount of returned items.</p>							|
| sort			| String[]			| **optional** <p>Order of returned items.</p>							|
| fields			| String[]			| **optional** <p>Fields to be returned.</p>							|

## Update password



	PUT /users/:id/password

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization			| String			|  <p>Basic authorization with email and password.</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| password			| String			|  <p>User's new password.</p>							|

## Update user



	PUT /users/:id


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access_token			| String			|  <p>User access_token.</p>							|
| name			| String			| **optional** <p>User's name.</p>							|
| picture			| String			| **optional** <p>User's picture.</p>							|



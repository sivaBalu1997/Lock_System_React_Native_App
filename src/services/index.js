import { request, gql, GraphQLClient } from 'graphql-request'

const myUrl = GRAPHQL_URL //YOUR GRAPHQL URL
const authToken = GRAPHQL_TOKEN // YOUR GRAPHQL TOKEN 
const graphClient = new GraphQLClient(myUrl, {
  headers: { authorization: `Bearer ${authToken}` }
})
export const fetchDoorFunc = async () => {
  const FetchDoorQuery = gql`
    query DoorAccounts {
        doorAccountDetails {
          id
         password
          userName
          doorId
          tempPassword
          tempPasswordDateTime
          email
        }
      }
      
`;
  try {
    const results = await request(myUrl, FetchDoorQuery)
    return results.doorAccountDetails
  }
  catch {
    return "Error"
  }
}

export const AddDoorAccount = async (body) => {

  const addQuery = gql`
    mutation gef($userName:String!,$doorId:String!,$password:String!,$email:String!){
        createDoorAccountDetail(data: { userName:$userName, password:$password,doorId:$doorId, email:$email}) {
          id
          userName
          password
          doorId
          email
        }
      }`

  const publishQuery = gql`
      mutation gef($userName:String!,$doorId:String!){
        publishDoorAccountDetail(where:{userName:$userName,doorId:$doorId},to:PUBLISHED){
         id
         password
          userName
          doorId
          email
        }
      }`
  try {
    const result = await graphClient.request(addQuery, body)
    const publish = await graphClient.request(publishQuery, { 'userName': body.userName, 'doorId': body.doorId })
    return publish.publishDoorAccountDetail
  }
  catch {
    return 'Error'
  }
}


export const CheckForLogin = async (body) => {
  const CheckDoorQuery = gql`
  query CheckForDoor($userName:String!) {
      doorAccountDetail(where:{userName:$userName}) {
        id
         password
          userName
          doorId
          tempPassword
          tempPasswordDateTime
          email
      }
    }
    
`;
  try {
    const results = await graphClient.request(CheckDoorQuery, { 'userName': body.userName })
    return results.doorAccountDetail
  }
  catch {
    return "Error"
  }
}


export const updateDoorAccount = async (body) => {

  const updateQuery = gql`
    mutation gef($userName:String!,$tempPassword:String!,$tempPasswordDateTime:DateTime!){
        updateDoorAccountDetail(where:{userName:$userName}data: {tempPassword:$tempPassword,tempPasswordDateTime:$tempPasswordDateTime}) {
          id
          userName
          password
          doorId
          tempPassword
          tempPasswordDateTime
          email
        }
      }`

  const publishQuery = gql`
      mutation gef($userName:String!){
        publishDoorAccountDetail(where:{userName:$userName},to:PUBLISHED){
         id
         password
          userName
          doorId
          tempPassword
          tempPasswordDateTime
          email
        }
      }`
  try {
    const result = await graphClient.request(updateQuery, body)
    const publish = await graphClient.request(publishQuery, { 'userName': body.userName })
    return publish.publishDoorAccountDetail
  }
  catch {
    return 'Error'
  }
}

const storage = require('azure-storage')
const uuid = require('uuid')
var retryOperations = new storage.ExponentialRetryPolicyFilter()
const service = storage.createTableService().withFilter(retryOperations)
const table = 'tasks'

const init = async () => (
  new Promise((resolve, reject) => {
    service.createTableIfNotExists(table, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const createTask = async (title, description) => (
  new Promise((resolve, reject) => {
    const generator = storage.TableUtilities.entityGenerator
    const task = {
      PartitionKey: generator.String('task'),
      RowKey: generator.String(uuid.v4()),
      title,
      description
    }

    !title ? function() { alert("Nie podano tytulu"); return reject(); } : service.insertEntity(table, task, (error, result, response) => {
      !error ? resolve() : reject()
    })
  })
)

const listTasks = async () => (
  new Promise((resolve, reject) => {
    const query = new storage.TableQuery()
      .select(['title'], ['description'], ['Timestamp'])
      .where('PartitionKey eq ?', 'task')

    service.queryEntities(table, query, null, (error, result, response) => {
      !error ? resolve(result.entries.map((entry) => ({
        title: entry.title._,
        description: !entry.description._ ? "Brak opisu" : entry.description._,
        Timestamp: entry.Timestamp._
      }))) : reject()
    })
  })
)

module.exports = {
  init,
  createTask,
  listTasks
}

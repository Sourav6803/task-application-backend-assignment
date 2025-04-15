let tasks = [];
let currentId = 1;
const { users } = require("../controllers/user");

const findTask = (title) => tasks.find((task) => task.title === title);

const createTask = async (req, res) => {
  try {
    const { title, description, userId, createdAt, ...rest } = req.body;
    const id = req.user?.id;

    const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(400).json({ message: "Not authorized, login first" });
    }

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    if (Object.keys(rest).length > 0) {
      return res
        .status(400)
        .json({ error: "Provide only title & description" });
    }

    if (findTask(title)) {
      return res.status(400).json({ error: "Tasks already exists" });
    }

    const newTask = {
      id: currentId++,
      title,
      description,
      userId: id,
      createdAt: Date.now(),
    };

    tasks.push(newTask);
    res.status(201).json({ message: "Task Created", task: newTask });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// const getTask = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "Not authorized, login first" });
//     }

//     let { page, limit, sort = 'createdAt', order = 'desc'} = req.query;

//     const id = req.user?.id;

//     const user = users.find((user) => user.id === id);
//     if (!user) {
//       return res.status(400).json({ message: "Not authorized, login first" });
//     }

//     if (!tasks || tasks.length === 0) {
//       return res.status(404).json({ message: "No task present" });
//     }

//     let allTask = tasks.filter((t) => t.userId === id);

//     if (page && limit) {
//       page = parseInt(page);
//       limit = parseInt(limit);

//       if (isNaN(page) || page < 1) {
//         return res.status(400).json({ message: "Page must be a number ≥ 1" });
//       }

//       if (isNaN(limit) || limit < 1) {
//         return res.status(400).json({ message: "Limit must be a number ≥ 1" });
//       }

//       const totalTasks = allTask.length;
//       const totalPages = Math.ceil(totalTasks / limit);

//       if (page > totalPages) {
//         return res.status(400).json({
//           message: `Only ${totalPages} page(s) available. Please choose a page between 1 and ${totalPages}`,
//         });
//       }

//       const startIndex = (page - 1) * limit;
//       const endIndex = startIndex + limit;
//       const paginatedTasks = allTask.slice(startIndex, endIndex);

//       return res.status(200).json({
//         message: "Tasks fetched successfully ",
//         currentPage: page,
//         totalPages,
//         totalTasks,
//         tasks: paginatedTasks,
//       });
//     }

//     res.status(200).json({
//       message: "Task fetched successfully",
//       tasks: allTask,
//       totalTasks: allTask.length,
//     });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// };

const getTask = async (req, res) => {
  try {
    const id = req.user?.id;

    if (!id) {
      return res.status(401).json({ message: "Not authorized, login first" });
    }

    const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(400).json({ message: "User not found, login first" });
    }

    let allTask = tasks.filter((task) => task.userId === id);

    if (allTask.length === 0) {
      return res.status(404).json({ message: "No tasks found" });
    }

    let { page, limit, sort = "createdAt", order = "desc", title } = req.query;

    // --- Filter by title (if given) ---
    if (title) {
      allTask = allTask.filter((task) =>
        task.title.toLowerCase().includes(title.toLowerCase())
      );
    }

    const validSortFields = ["title", "description", "createdAt"];
    if (!validSortFields.includes(sort)) {
      return res
        .status(400)
        .json({
          message: `Invalid sort field. Use one of: ${validSortFields.join(
            ", "
          )}`,
        });
    }

    order = order === "asc" ? "asc" : "desc";
    allTask.sort((a, b) => {
      if (order === "asc") {
        return a[sort] > b[sort] ? 1 : -1;
      } else {
        return a[sort] < b[sort] ? 1 : -1;
      }
    });

    if (page && limit) {
      page = parseInt(page);
      limit = parseInt(limit);

      if (isNaN(page) || page < 1) {
        return res
          .status(400)
          .json({
            message: "Page must be a number greater than or equal to 1",
          });
      }

      if (isNaN(limit) || limit < 1) {
        return res
          .status(400)
          .json({
            message: "Limit must be a number greater than or equal to 1",
          });
      }

      const totalTasks = allTask.length;
      const totalPages = Math.ceil(totalTasks / limit);

      if (page > totalPages) {
        return res.status(400).json({
          message: `Only ${totalPages} page(s) available. Please choose a page between 1 and ${totalPages}`,
        });
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTasks = allTask.slice(startIndex, endIndex);

      return res.status(200).json({
        message: "Tasks fetched successfully (paginated)",
        currentPage: page,
        totalPages,
        totalTasks,
        tasks: paginatedTasks,
      });
    }

    // --- No pagination: return all (filtered/sorted) tasks ---
    res.status(200).json({
      message: "Tasks fetched successfully",
      totalTasks: allTask.length,
      tasks: allTask,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = users.find((user) => user.id === userId);
    if (!user) {
      return res.status(400).json({ message: "Not authorized, login first" });
    }

    const id = parseInt(req.params.id);
    const task = tasks.filter((t) => t.userId === userId);

    const exactTask = task.find((t) => t.id === id);

    if (exactTask) {
      res.status(200).json({ task: exactTask });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateTaskById = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = users.find((user) => user.id === userId);
    if (!user) {
      return res.status(400).json({ message: "Not authorized, login first" });
    }

    const id = parseInt(req.params.id);
    const { title, description } = req.body;

    const task = tasks.filter((t) => t.userId === userId);

    const taskIndex = task.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    tasks[taskIndex] = { id, title, description, userId: userId };
    console.log(tasks[taskIndex]);

    res.status(200).json(tasks[taskIndex]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const deleteTaskById = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = users.find((user) => user.id === userId);
    if (!user) {
      return res.status(400).json({ message: "Not authorized, login first" });
    }

    const task = tasks.filter((t) => t.userId === userId);

    const id = parseInt(req.params.id);

    const taskIndex = task.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks.splice(taskIndex, 1);
    res.status(204).send({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createTask = createTask;
module.exports.getTask = getTask;
module.exports.getTaskById = getTaskById;
module.exports.updateTaskById = updateTaskById;
module.exports.deleteTaskById = deleteTaskById;

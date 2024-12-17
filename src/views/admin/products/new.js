const layout = require('../layout');
const { getError } = require('../../../utilities/getErrorHelper');

module.exports = ({ req, errors, submitError }) => {
  return layout({
    content: `
      <form method="POST" enctype="multipart/form-data">
        <input placeholder="Title" name="title" />
        ${getError(errors, 'title')}
        <input placeholder="Price" name="price" />
        ${getError(errors, 'price')}
        <input type="file" name="image" />
        <button>Submit</button>
        ${submitError ? submitError : ''}
      </form>
    `,
  });
};

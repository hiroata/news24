const { getAllNovels } = require('../../../lib/novels');
const i18n = require('../../../lib/utils/i18n');
const { DEFAULT_LANGUAGE, isValidLang } = i18n;
const { ApiError, getFriendlyErrorMessage } = require('../../../lib/utils/apiUtils');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let lang = req.query.lang;

    if (lang && !isValidLang(lang)) {
      throw new ApiError(400, 'Bad Request', 'Invalid language code provided.');
    }
    if (!lang) {
      lang = DEFAULT_LANGUAGE;
    }

    const novels = getAllNovels(lang);
    return res.status(200).json(novels);

  } catch (error) {
    console.error('API Error getting novels:', error);
    if (error instanceof ApiError) {
      return res.status(error.status).json({ 
        error: error.message,
        message: getFriendlyErrorMessage(error)
      });
    }
    return res.status(500).json({ 
      error: 'Failed to fetch novels',
      message: getFriendlyErrorMessage(error)
    });
  }
}

module.exports = handler;

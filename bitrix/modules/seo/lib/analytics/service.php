<?

namespace Bitrix\Seo\Analytics;

use Bitrix\Main\Loader;

use Bitrix\Seo\Retargeting\IService;
use Bitrix\Seo\Retargeting\AuthAdapter;

class Service implements IService
{
	const GROUP = 'analytics';

	const TYPE_FACEBOOK = 'facebook';
	const TYPE_INSTAGRAM = 'instagram';
	const TYPE_VKONTAKTE = 'vkontakte';
	const TYPE_GOOGLE = 'google';
	const TYPE_YANDEX = 'yandex';

	/** @var array $errors Errors. */
	protected static $errors = [];

	/**
	 * Get instance.
	 *
	 * @return static
	 */
	public static function getInstance()
	{
		static $instance = null;
		if ($instance === null)
		{
			$instance = new static();
		}

		return $instance;
	}

	/**
	 * Return true if it can use.
	 *
	 * @return bool
	 */
	public static function canUse()
	{
		return Loader::includeModule('seo') && Loader::includeModule('socialservices');
	}

	/**
	 * @param string $type
	 * @return string
	 */
	public static function getEngineCode($type)
	{
		return static::GROUP . '.' . $type;
	}

	/**
	 * @param string $type
	 * @return Account
	 */
	public static function getAccount($type)
	{
		return Account::create($type)->setService(static::getInstance());
	}

	/**
	 * @return array
	 */
	public static function getTypes()
	{
		return array(
			static::TYPE_FACEBOOK,
			static::TYPE_VKONTAKTE,
			static::TYPE_GOOGLE,
			static::TYPE_INSTAGRAM,
			static::TYPE_YANDEX,
		);
	}

	/**
	 * Get auth adapter.
	 *
	 * @param string $type Type.
	 * @return AuthAdapter
	 */
	public static function getAuthAdapter($type)
	{
		return AuthAdapter::create($type)->setService(static::getInstance());
	}

	/**
	 * Get providers.
	 *
	 * @param array|null $types Types.
	 * @return array
	 */
	public static function getProviders(array $types = null)
	{
		$providers = static::getServiceProviders($types);

		return $providers;
	}

	protected static function getServiceProviders(array $types = null)
	{
		$typeList = static::getTypes();

		$providers = array();
		foreach ($typeList as $type)
		{
			if ($types && !in_array($type, $types))
			{
				continue;
			}

			$authAdapter = static::getInstance()->getAuthAdapter($type);
			$account = static::getInstance()->getAccount($type);

			$providers[$type] = array(
				'TYPE' => $type,
				'HAS_AUTH' => $authAdapter->hasAuth(),
				'AUTH_URL' => $authAdapter->getAuthUrl(),
				'HAS_ACCOUNTS' => $account->hasAccounts(),
				'PROFILE' => $account->getProfileCached(),
			);

			// check if no profile, then may be auth was removed in service
			if ($providers[$type]['HAS_AUTH'] && empty($providers[$type]['PROFILE']))
			{
				static::removeAuth($type);
				$providers[$type]['HAS_AUTH'] = false;
			}
		}

		return $providers;
	}

	/**
	 * Get accounts.
	 *
	 * @param string $type Type.
	 * @return array
	 */
	public static function getAccounts($type)
	{
		if (!static::canUse())
		{
			return array();
		}

		$result = array();

		$account = static::getInstance()->getAccount($type);
		$accountsResult = $account->getList();
		if ($accountsResult->isSuccess())
		{
			while ($accountData = $accountsResult->fetch())
			{
				$accountData = $account->normalizeListRow($accountData);
				if ($accountData['ID'])
				{
					$result[] = array(
						'id' => $accountData['ID'],
						'name' => $accountData['NAME'] ? $accountData['NAME'] : $accountData['ID']
					);
				}
			}
		}
		else
		{
			self::$errors = $accountsResult->getErrorMessages();
		}

		return $result;
	}

	/**
	 * Remove auth.
	 *
	 * @param string $type Type.
	 * @return void
	 */
	public static function removeAuth($type)
	{
		static::getInstance()->getAuthAdapter($type)->removeAuth();
	}

	/**
	 * Get errors.
	 *
	 * @return array
	 */
	public static function getErrors()
	{
		return self::$errors;
	}

	/**
	 * Reset errors.
	 *
	 * @return void
	 */
	public static function resetErrors()
	{
		self::$errors = array();
	}

	/**
	 * Return true if it has errors.
	 *
	 * @return bool
	 */
	public static function hasErrors()
	{
		return count(self::$errors) > 0;
	}
}
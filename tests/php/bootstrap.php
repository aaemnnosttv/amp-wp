<?php
/**
 * PHPUnit bootstrap file
 *
 * @package {{plugin_package}}
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests';
}

if ( ! file_exists( $_tests_dir . '/includes/functions.php' ) ) {
	echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL;
	exit( 1 );
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function() {
		require_once dirname( __DIR__, 2 ) . '/amp.php';
	}
);

/**
 * Force defined plugins to be active at runtime.
 *
 * @param array $active_plugins
 * @return array
 */
function _filter_active_plugins( $active_plugins ) {
	$forced_active_plugins = array();

	if ( defined( 'WP_TEST_ACTIVATED_PLUGINS' ) ) {
		$forced_active_plugins = preg_split( '/\s*,\s*/', WP_TEST_ACTIVATED_PLUGINS );
	}

	if ( ! empty( $forced_active_plugins ) ) {
		foreach ( $forced_active_plugins as $forced_active_plugin ) {
			$active_plugins[] = $forced_active_plugin;
		}
	}

	return $active_plugins;
}

tests_add_filter( 'site_option_active_sitewide_plugins', '_filter_active_plugins' );
tests_add_filter( 'option_active_plugins', '_filter_active_plugins' );


// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';

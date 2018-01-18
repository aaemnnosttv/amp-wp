<?php
/**
 * Tests for class AMP_Widget_Media_Image.
 *
 * @package AMP
 */

/**
 * Tests for class AMP_Widget_Media_Image.
 *
 * @package AMP
 */
class Test_AMP_Widget_Media_Image extends WP_UnitTestCase {

	/**
	 * Instance of the widget.
	 *
	 * @var object
	 */
	public $instance;

	/**
	 * Setup.
	 *
	 * @inheritdoc
	 */
	public function setUp() {
		parent::setUp();
		AMP_Theme_Support::init();
		$amp_widgets = new AMP_Widgets();
		$amp_widgets->register_widgets();
		$this->instance = new AMP_Widget_Media_Image();
	}

	/**
	 * Test construct().
	 *
	 * @see AMP_Widget_Media_Image::__construct().
	 */
	public function test_construct() {
		global $wp_widget_factory;
		$amp_widget = $wp_widget_factory->widgets['AMP_Widget_Media_Image'];

		$this->assertEquals( 'media_image', $amp_widget->id_base );
		$this->assertEquals( 'Image', $amp_widget->name );
		$this->assertEquals( 'widget_media_image', $amp_widget->widget_options['classname'] );
		$this->assertEquals( true, $amp_widget->widget_options['customize_selective_refresh'] );
		$this->assertEquals( 'Displays an image.', $amp_widget->widget_options['description'] );
	}

	/**
	 * Test render_media().
	 *
	 * Mock image logic mainly copied from Test_WP_Widget_Media_image::test_render_media().
	 *
	 * @see AMP_Widget_Media_Image::render_media().
	 */
	public function test_render_media() {
		$first_test_image = '/tmp/test-image.jpg';
		copy( DIR_TESTDATA . '/images/test-image.jpg', $first_test_image );
		$attachment_id = self::factory()->attachment->create_object( array(
			'file'           => $first_test_image,
			'post_parent'    => 0,
			'post_mime_type' => 'image/jpeg',
			'post_title'     => 'Test Image',
		) );
		wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $first_test_image ) );
		$instance = array(
			'title'         => 'Test Image Widget',
			'attachment_id' => $attachment_id,
			'height'        => 100,
			'width'         => 100,
			'url'           => 'https://example.com/amp',
		);

		ob_start();
		$this->instance->render_media( $instance );
		$output = ob_get_clean();

		$this->assertFalse( strpos( $output, '<img' ) );
		$this->assertFalse( strpos( $output, 'style=' ) );
	}

}

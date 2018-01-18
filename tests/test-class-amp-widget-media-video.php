<?php
/**
 * Tests for class AMP_Widget_Media_Video.
 *
 * @package AMP
 */

/**
 * Tests for class AMP_Widget_Media_Video.
 *
 * @package AMP
 */
class Test_AMP_Widget_Media_Video extends WP_UnitTestCase {

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
		$this->instance = new AMP_Widget_Media_Video();
	}

	/**
	 * Test construct().
	 *
	 * @see AMP_Widget_Media_Video::__construct().
	 */
	public function test_construct() {
		global $wp_widget_factory;
		$amp_widget = $wp_widget_factory->widgets['AMP_Widget_Media_Video'];

		$this->assertEquals( 'media_video', $amp_widget->id_base );
		$this->assertEquals( 'Video', $amp_widget->name );
		$this->assertEquals( 'widget_media_video', $amp_widget->widget_options['classname'] );
		$this->assertEquals( true, $amp_widget->widget_options['customize_selective_refresh'] );
		$this->assertEquals( 'Displays a video from the media library or from YouTube, Vimeo, or another provider.', $amp_widget->widget_options['description'] );
	}

	/**
	 * Test render_media().
	 *
	 * Mock video logic mainly copied from Test_WP_Widget_Media_image::test_render_media().
	 *
	 * @see AMP_Widget_Media_Video::render_media().
	 */
	public function test_render_media() {
		$video = '/tmp/small-video.mp4';
		copy( DIR_TESTDATA . '/uploads/small-video.mp4', $video );
		$attachment_id = self::factory()->attachment->create_object( array(
			'file'           => $video,
			'post_parent'    => 0,
			'post_mime_type' => 'video/mp4',
			'post_title'     => 'Test Video',
		) );
		wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $video ) );
		$instance = array(
			'title'         => 'Test Video Widget',
			'attachment_id' => $attachment_id,
			'url'           => 'https://example.com/amp',
		);

		ob_start();
		$this->instance->render_media( $instance );
		$output = ob_get_clean();

		$this->assertFalse( strpos( $output, '<video' ) );
		$this->assertFalse( strpos( $output, 'style=' ) );
	}

}

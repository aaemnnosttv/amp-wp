/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { RangeControl, SelectControl, IconButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ANIMATION_DURATION_DEFAULTS, AMP_ANIMATION_TYPE_OPTIONS, STORY_PAGE_INNER_WIDTH, STORY_PAGE_INNER_HEIGHT } from '../constants';
import { getBlockInnerElementForAnimation, getPixelsFromPercentage } from '../helpers';
import { AnimationOrderPicker } from './';

/**
 * Animation controls for AMP Story layout blocks'.
 *
 * @return {Component} Controls.
 */
const AnimationControls = ( {
	animatedBlocks,
	onAnimationTypeChange,
	onAnimationDurationChange,
	onAnimationDelayChange,
	onAnimationAfterChange,
	animationType,
	animationDuration,
	animationDelay,
	animationAfter,
	selectedBlock,
	playAnimation,
} ) => {
	const DEFAULT_ANIMATION_DURATION = ANIMATION_DURATION_DEFAULTS[ animationType ] || 0;

	const isImageBlock = selectedBlock && 'core/image' === selectedBlock.name;

	// pan- animations are only really meant for images.
	const animationTypeOptions = AMP_ANIMATION_TYPE_OPTIONS.filter( ( { value } ) => {
		return ! ( value.startsWith( 'pan-' ) && ! isImageBlock );
	} );

	return (
		<>
			<SelectControl
				label={ __( 'Animation Type', 'amp' ) }
				value={ animationType }
				options={ animationTypeOptions }
				onChange={ ( value ) => {
					onAnimationTypeChange( value );

					// Also update these values as these can change per type.
					onAnimationDurationChange( ANIMATION_DURATION_DEFAULTS[ value ] || 0 );
					onAnimationDelayChange( 0 );
				} }
			/>
			{ animationType && (
				<>
					<RangeControl
						label={ __( 'Duration (ms)', 'amp' ) }
						value={ animationDuration }
						onChange={ onAnimationDurationChange }
						min="0"
						max="5000"
						placeholder={ DEFAULT_ANIMATION_DURATION }
						initialPosition={ DEFAULT_ANIMATION_DURATION }
					/>
					<RangeControl
						label={ __( 'Delay (ms)', 'amp' ) }
						value={ animationDelay || 0 }
						onChange={ onAnimationDelayChange }
						min="0"
						max="5000"
					/>
					<AnimationOrderPicker
						value={ animationAfter }
						options={ animatedBlocks() }
						onChange={ onAnimationAfterChange }
					/>
					<IconButton
						icon="controls-play"
						onClick={ () => playAnimation( animationType, animationDuration, animationDelay ) }
					>
						{ __( 'Play Animation', 'amp' ) }
					</IconButton>
				</>
			) }
		</>
	);
};

AnimationControls.propTypes = {
	animatedBlocks: PropTypes.func.isRequired,
	onAnimationTypeChange: PropTypes.func.isRequired,
	onAnimationDurationChange: PropTypes.func.isRequired,
	onAnimationDelayChange: PropTypes.func.isRequired,
	onAnimationAfterChange: PropTypes.func.isRequired,
	playAnimation: PropTypes.func.isRequired,
	animationType: PropTypes.string,
	animationDuration: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	animationDelay: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
	animationAfter: PropTypes.string,
	selectedBlock: PropTypes.object,
};

const withSelectedBlock = withSelect( ( select ) => {
	const { getSelectedBlock } = select( 'core/block-editor' );

	const selectedBlock = getSelectedBlock();

	return {
		selectedBlock,
	};
} );

const withAnimationPlayer = withDispatch( ( dispatch, { selectedBlock } ) => {
	return {
		// @todo: Perhaps unselect block before starting the animation.
		playAnimation: ( animationType, animationDuration, animationDelay = 0 ) => {
			if ( ! selectedBlock ) {
				return;
			}

			const blockElement = getBlockInnerElementForAnimation( selectedBlock );

			if ( ! blockElement ) {
				return;
			}

			// @todo Account for CTA blocks and rotated blocks.
			const { positionTop, positionLeft, width, height } = selectedBlock.attributes;

			const DEFAULT_ANIMATION_DURATION = ANIMATION_DURATION_DEFAULTS[ animationType ] || 0;
			const animationName = `story-animation-${ animationType }`;

			blockElement.classList.remove( animationName );

			blockElement.style.setProperty( '--animation-duration', `${ animationDuration || DEFAULT_ANIMATION_DURATION }ms` );
			blockElement.style.setProperty( '--animation-delay', `${ animationDelay }ms` );

			let offsetX;
			let offsetY;

			switch ( animationType ) {
				case 'fly-in-left':
				case 'rotate-in-left':
				case 'whoosh-in-left':
					offsetX = -( getPixelsFromPercentage( 'x', positionLeft ) + width );
					break;
				case 'fly-in-right':
				case 'rotate-in-right':
				case 'whoosh-in-right':
					offsetX = STORY_PAGE_INNER_WIDTH + getPixelsFromPercentage( 'x', positionLeft ) + width;
					break;
				case 'fly-in-top':
					offsetY = -( getPixelsFromPercentage( 'y', positionTop ) + height );
					break;
				case 'fly-in-bottom':
					// const offsetY = dimensions.pageHeight - dimensions.targetY;
					offsetY = STORY_PAGE_INNER_HEIGHT + getPixelsFromPercentage( 'x', positionTop ) + height;
					break;
				case 'drop':
					offsetY = Math.max( 160, ( getPixelsFromPercentage( 'y', positionTop ) + height ) );
					break;
				default:
					offsetX = 0;
			}

			blockElement.style.setProperty( '--animation-offset-x', `${ offsetX }px` );
			blockElement.style.setProperty( '--animation-offset-y', `${ offsetY }px` );

			blockElement.classList.add( animationName );

			blockElement.addEventListener( 'animationend', () => blockElement.classList.remove( animationName ), { once: true } );
		},
	};
} );

const enhance = compose(
	withSelectedBlock,
	withAnimationPlayer,
);

export default enhance( AnimationControls );
